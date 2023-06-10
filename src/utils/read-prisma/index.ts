import path from 'path'
import { Prisma } from './Prisma'
import { Field, Model } from './types'
import handlebars from 'handlebars'
import { promises } from 'fs'
import { makePlural, writeFile } from '..'
import prettier from 'prettier'
import { InferField, InferType } from '../../types'
import { PrismaScalarTypes } from '../../enums'

handlebars.registerHelper('lowercase', function (str) {
    if (str && typeof str === 'string') {
        return str.toLowerCase()
    }
    return ''
})

handlebars.registerHelper('uppercase', function (str) {
    if (str && typeof str === 'string') {
        return str.toUpperCase()
    }
    return ''
})

handlebars.registerHelper('plural', function (str) {
    if (str && typeof str === 'string') {
        return makePlural(str)
    }
    return ''
})

handlebars.registerHelper('lowercasePlural', function (str) {
    if (str && typeof str === 'string') {
        return makePlural(str).toLowerCase()
    }
    return ''
})

handlebars.registerHelper('capitalize', function (str) {
    if (str && typeof str === 'string') {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    }
    return ''
})

const refineTemplatesPath = path.join(__dirname, '../../../templates/refine')

const prisma = new Prisma()
export const readPrisma = async () => {
    await prisma.init()
    console.log(JSON.stringify(prisma.getModels()))
    return {
        models: prisma.getModels(),
        isRefisma: prisma.getIsRefisma(),
    }
}

export const generateRefinePages = async (models: Model[]) => {
    models.forEach((model) => {
        generateRefinePagesForModel(model)
    })
}

const generateRefinePagesForModel = async (model: Model) => {
    const template = await promises.readFile(path.join(refineTemplatesPath, 'inferencer.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const mainPath = 'pages/'

    const actions = [
        {
            name: 'list',
            path: `${mainPath}${makePlural(model.name.toLowerCase())}/index.tsx`,
        },
        {
            name: 'create',
            path: `${mainPath}${makePlural(model.name.toLowerCase())}/create/index.tsx`,
        },
        {
            name: 'edit',
            path: `${mainPath}${makePlural(model.name.toLowerCase())}/edit/[id].tsx`,
        },
        {
            name: 'show',
            path: `${mainPath}${makePlural(model.name.toLowerCase())}/show/[id].tsx`,
        },
    ]
    actions.forEach(async (action) => {
        const compiledTemplate = prettier.format(
            templateCompiler({
                ...model,
                action: action.name,
                fieldTransformer: `
                    const fields = ${JSON.stringify(generateFieldTransformer(model.fields))}
                `,
            }),
            { parser: 'typescript' },
        )
        writeFile(action.path, compiledTemplate)
    })
}

const generateFieldTransformer = (fields: Field[]): InferField[] => {
    const inferFields: InferField[] = []

    for (const field of fields) {
        const resourceName = makePlural(field.type.replace('[]', '').replace('?', '')).toLowerCase()
        const inferField: InferField = {
            key: field.name,
            type: typeToInferType(field),
            relation: !!field.relation,
            multiple: field.multiple,
        }

        if (typeof field.relation === 'object') {
            const resourceName = makePlural(field.relation.type.replace('[]', '').replace('?', '')).toLowerCase()
            inferField.resource = {
                name: resourceName,
                route: `/${resourceName}`,
            }
        } else if (field.relation) {
            inferField.resource = {
                name: resourceName,
                route: `/${resourceName}`,
            }

            if (field.multiple) {
                inferField.accessor = 'id'
            }
        }
        inferFields.push(inferField)
    }

    return inferFields
}

const typeToInferType = (field: Field): InferType => {
    if (field.relation) {
        return 'relation'
    }
    if (field.multiple) {
        return 'array'
    }
    switch (field.type) {
        case PrismaScalarTypes.String:
            return 'text'
        case PrismaScalarTypes.Int:
        case PrismaScalarTypes.Float:
        case PrismaScalarTypes.Decimal:
            return 'number'
        case PrismaScalarTypes.Boolean:
            return 'boolean'
        case PrismaScalarTypes.DateTime:
            return 'date'
        case PrismaScalarTypes.Json:
        case PrismaScalarTypes.Bytes:
            return 'unknown'
        default:
            return 'text'
    }
}
