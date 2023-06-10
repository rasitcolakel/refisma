import path from 'path'
import { Prisma } from './Prisma'
import { Field, Model } from './types'
import handlebars from 'handlebars'
import { promises } from 'fs'
import { makePlural, writeFile } from '..'
import prettier from 'prettier'
import { InferField, InferType } from '../../types'
import { PrismaScalarTypes } from '../../enums'
import { prismaTypeToTS } from '..'

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
const serverTemplatesPath = path.join(__dirname, '../../../templates/server')

const prisma = new Prisma()
export const readPrisma = async () => {
    await prisma.init()
    return {
        models: prisma.getModels(),
        isRefisma: prisma.getIsRefisma(),
    }
}

export const generateZodSchema = async (models: Model[]) => {
    models.forEach((model) => {
        let imports = `
            import * as z from "zod";
            `
        let template = `
            export const ${model.name}Schema = z.object({
                ${model.fields
                    .map((field) => {
                        if (!prisma.checkScalarType(field.type) && typeof field.relation === 'object') {
                            return null
                        }
                        let property = `${field.name}: z`
                        if (prisma.checkScalarType(field.type)) {
                            if (field.name === 'id') {
                                if (field.type === 'Int' || field.type === 'Decimal' || field.type === 'Float') {
                                    property += `
                                 .preprocess((value) => Array.isArray(value) ? value.map(Number) : Number(value), z.union([z.number(), z.array(z.number())]))`
                                } else {
                                    property += `.union([z.${prismaTypeToTS(field.type)}(), z.array(z.${prismaTypeToTS(
                                        field.type,
                                    )}())])`
                                }
                            } else {
                                if (field.type === 'Int' || field.type === 'Decimal' || field.type === 'Float') {
                                    property += `.preprocess(Number, z.number())`
                                } else if (field.type === 'Boolean') {
                                    property += `.preprocess(Boolean, z.boolean())`
                                } else {
                                    property += `.${prismaTypeToTS(field.type)}()`
                                }
                            }
                        } else {
                            const rawType = field.type.replace('[]', '').replace('?', '')
                            imports += `import { ${rawType}Schema } from "./${rawType}Schema";\n`

                            if (field.multiple) {
                                property += `.array(${rawType}Schema.pick({ id: true }))`
                            } else {
                                property = `${field.name}: ${rawType}Schema`
                            }
                        }

                        if (!field.required) {
                            property += '.optional()'
                        }
                        return property + ','
                    })
                    .join('\n')}
            })

            export type ${model.name}Type = z.infer<typeof ${model.name}Schema>;
        `

        // remove empty lines
        template = template.replace(/^\s*[\r\n]/gm, '')

        imports += `
            import { PaginationSchema } from "./Schema";
        `
        template += `
            export const ${model.name}Body = ${model.name}Schema.omit({
                id: true,
            });

            export type ${model.name}BodyType = z.infer<typeof ${model.name}Body>;

            export const ${model.name}Query = ${model.name}Schema.pick({
                id: true,
            }).merge(PaginationSchema);

            export type ${model.name}QueryType = z.infer<typeof ${model.name}Query>;
        `

        imports = imports.replace(/^\s*[\r\n]/gm, '')
        imports += '\n'
        const compiledTemplate = prettier.format(imports + template, { parser: 'typescript' })
        writeFile(`schemas/${model.name}Schema.ts`, compiledTemplate)
    })

    generateMainSchema()
}

const generateMainSchema = async () => {
    const template = await promises.readFile(path.join(serverTemplatesPath, 'schema/main.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const compiledTemplate = prettier.format(templateCompiler({}), { parser: 'typescript' })
    writeFile('schemas/Schema.ts', compiledTemplate)
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
        if (!prisma.checkScalarType(field.type) && typeof field.relation === 'object') {
            continue
        }
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
            inferField.relationInfer = {
                accessor: 'id',
                key: 'id',
                type: 'relation',
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
