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
import {
    generateCreateFunction,
    generateDeleteFunction,
    generateFindManyFunction,
    generateFindOneFunction,
    generateSelect,
    generateUpdateFunction,
} from './serviceFunctions'
import { makeEndpoints } from './endpointFunctions'

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

handlebars.registerHelper('isArray', function (arg1: string, options) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Array.isArray(arg1) || arg1?.includes(',') ? options.fn(this) : options.inverse(this)
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
    let imports = `
    import * as z from "zod";
    import { PaginationSchema } from "./Schema";
    `
    let template = ``

    let importantSchemas = `
        // IMPORTANT: These schemas may be used in other schemas, so they must defined first
    `

    // sort by multiple relation count ascending
    const sorted = models.sort((a, b) => {
        const aCount = a.fields.filter((field) => field.multiple && field.relation).length
        const bCount = b.fields.filter((field) => field.multiple && field.relation).length
        return aCount - bCount
    })

    sorted.forEach((model) => {
        const idField = model.fields.find((field) => field.name === 'id')

        if (idField) {
            importantSchemas += `
                export const ${model.name}IdSchema = z.object({
                    id: ${idField.type === 'Int' ? 'z.preprocess(Number, z.number())' : 'z.string()'},
                });
                export const ${model.name}SingleQuerySchema = z.object({
                    query: ${model.name}IdSchema,
                });
            `
        }

        template += `
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
                                        .preprocess(
                                            (value) => Array.isArray(value) ? value.map(Number) : Number(value),
                                            z.union([z.number(), z.array(z.number())])
                                        )`
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
                            if (field.multiple) {
                                property += `.array(${rawType}IdSchema)`
                            } else {
                                property = `${field.name}: ${rawType}IdSchema`
                            }
                        }

                        if (!field.required || field.name === 'id') {
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

        template += `
            export const ${model.name}Body = ${model.name}Schema.omit({
                id: true,
            });

            export const ${model.name}Query = ${model.name}Schema.pick({
                id: true,
            }).merge(PaginationSchema);

            export const ${model.name}QuerySchema = z.object({
                query: ${model.name}Query,
            });

            export const ${model.name}BodySchema = z.object({
                body: ${model.name}Body,
            });

            export const ${model.name}Create = ${model.name}BodySchema;
            export type ${model.name}CreateType = z.infer<typeof ${model.name}Create>;
            export const ${model.name}Update = ${model.name}BodySchema.merge(${model.name}SingleQuerySchema);
            export type ${model.name}UpdateType = z.infer<typeof ${model.name}Update>;
            export const ${model.name}Delete = ${model.name}SingleQuerySchema;
            export type ${model.name}DeleteType = z.infer<typeof ${model.name}Delete>;
            export const ${model.name}FindOne = ${model.name}SingleQuerySchema;
            export type ${model.name}FindOneType = z.infer<typeof ${model.name}FindOne>;
            export const ${model.name}FindMany = ${model.name}QuerySchema;
            export type ${model.name}FindManyType = z.infer<typeof ${model.name}FindMany>;
        `
    })

    imports = imports.replace(/^\s*[\r\n]/gm, '')
    imports += '\n'
    const compiledTemplate = prettier.format(imports + importantSchemas + template, { parser: 'typescript' })
    writeFile(`schemas/index.ts`, compiledTemplate)

    generateMainSchema()
}

export const generateServices = async (models: Model[]) => {
    models.forEach((model) => {
        let template = ``
        const imports = `
        import { Prisma } from '@prisma/client'
        import * as ${model.name}Schema from '@schemas/index'
        import { getPrisma } from './Service'

        const model = getPrisma().${model.name.toLowerCase()};
        `
        template += generateSelect(models, model.name)
        template += generateCreateFunction(model)
        template += generateUpdateFunction(model)
        template += generateDeleteFunction(model)
        template += generateFindOneFunction(model)
        template += generateFindManyFunction(model)

        const compiledTemplate = prettier.format(imports + template, { parser: 'typescript' })
        writeFile(`services/${model.name}Service.ts`, compiledTemplate)
    })

    generateMainService()
}

const generateMainSchema = async () => {
    const template = await promises.readFile(path.join(serverTemplatesPath, 'schema/main.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const compiledTemplate = prettier.format(templateCompiler({}), { parser: 'typescript' })
    writeFile('schemas/Schema.ts', compiledTemplate)
}

const generateMainService = async () => {
    const template = await promises.readFile(path.join(serverTemplatesPath, 'service/main.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const compiledTemplate = prettier.format(templateCompiler({}), { parser: 'typescript' })
    writeFile('services/Service.ts', compiledTemplate)
}

export const generateEndpoints = async (models: Model[]) => {
    const template = await promises.readFile(path.join(serverTemplatesPath, 'endpoint.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)
    models.forEach((model) => {
        const { pluralEndpoints, singularEndpoints } = makeEndpoints(model)

        // Plural endpoints
        const pluralCompiledTemplate = prettier.format(
            templateCompiler({
                ...model,
                endpoints: pluralEndpoints,
            }),
            { parser: 'typescript' },
        )
        writeFile(`pages/api/${makePlural(model.name).toLowerCase()}/index.ts`, pluralCompiledTemplate)

        const singularCompiledTemplate = prettier.format(
            templateCompiler({
                ...model,
                endpoints: singularEndpoints,
            }),
            { parser: 'typescript' },
        )
        writeFile(`pages/api/${makePlural(model.name).toLowerCase()}/[id].ts`, singularCompiledTemplate)
    })
}

export const generateRefinePages = async (models: Model[]) => {
    models.forEach(async (model) => {
        await generateRefinePagesForModel(model)
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
                inferencer: prisma.getInferencer(),
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
