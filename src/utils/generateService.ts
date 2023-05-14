import { findIdField, generateZodSchema, getFieldType, prismaTypeToTS, writeFile } from './../utils'
import { readFileSync } from 'fs'
import handlebars from 'handlebars'
import path from 'path'
import { Model, Repository } from './../types'
import prettier from 'prettier'
import { MethodNames } from '../enums'
import { generateApiFile } from './generateApiFiles'
import { generateZodFile } from './generateZodSChemas'
export const generateService = (model: Model) => {
    const template = readFileSync(path.join(__dirname, '../../templates', 'service.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const idField = findIdField(model.fields)

    if (!idField) {
        throw new Error(`Model ${model.name} does not have an @id field`)
    }

    const typeOfId = prismaTypeToTS(idField.type)
    if (!typeOfId) {
        throw new Error(`Model ${model.name} does not have an @id field`)
    }

    const templateParams: Repository = {
        name: model.name,
        lowercasedName: model.name.charAt(0).toLowerCase() + model.name.slice(1),
        methods: [
            {
                isSingular: false,
                method: 'POST',
                name: MethodNames.create,
                params: [
                    {
                        name: 'body',
                        type: `Prisma.${model.name}CreateInput`,
                        from: 'req.body',
                    },
                ],
                requestParams: [
                    {
                        name: 'body',
                        as: 'data',
                        type: `Prisma.${model.name}CreateInput`,
                    },
                ],
            },
            {
                isSingular: true,
                name: MethodNames.getById,
                method: 'GET',
                params: [
                    {
                        name: idField.name,
                        type: typeOfId,
                        from: 'req.query.' + idField.name,
                    },
                ],
                customName: 'findUnique',
                requestParams: [
                    {
                        name: 'query',
                        as: 'where',
                        values: [
                            {
                                name: idField.name,
                                type: typeOfId,
                            },
                        ],
                    },
                ],
            },
            {
                isSingular: false,
                method: 'GET',
                name: MethodNames.findMany,
                params: [],
                requestParams: [],
            },
            {
                isSingular: true,
                method: 'PUT',
                name: MethodNames.update,
                params: [
                    {
                        name: idField.name,
                        type: typeOfId,
                        from: 'req.query.' + idField.name,
                    },
                    {
                        name: 'body',
                        type: `Prisma.${model.name}UpdateInput`,
                        from: 'req.body',
                    },
                ],
                requestParams: [
                    {
                        name: 'query',
                        as: 'where',
                        values: [
                            {
                                name: idField.name,
                                type: typeOfId,
                            },
                        ],
                    },
                    {
                        name: 'body',
                        type: `Prisma.${model.name}UpdateInput`,
                        as: 'data',
                    },
                ],
            },
            {
                isSingular: true,
                method: 'DELETE',
                name: MethodNames.delete,
                params: [
                    {
                        name: idField.name,
                        type: typeOfId,
                        from: 'req.query.' + idField.name,
                    },
                ],
                requestParams: [
                    {
                        name: 'query',
                        as: 'where',
                        values: [
                            {
                                name: idField.name,
                                type: typeOfId,
                            },
                        ],
                    },
                ],
            },
        ],
        zodSchema: generateZodSchema(model.fields),
    }
    const compiledTemplate = prettier.format(templateCompiler(templateParams), { parser: 'typescript' })

    writeFile(`services/${model.name}Service.ts`, compiledTemplate)
    generateZodFile(model, templateParams)
    // generate single file for all endpoints
    generateApiFile(
        model,
        {
            ...templateParams,
            methods: templateParams.methods.filter((method) => method.isSingular),
        },
        '[id]',
    )
    generateApiFile(
        model,
        {
            ...templateParams,
            methods: templateParams.methods.filter((method) => !method.isSingular),
        },
        'index',
    )

    return templateCompiler
}
