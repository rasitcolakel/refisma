import { getFieldByName, getFieldType, prismaTypeToTS, writeFile } from './../utils'
import { readFileSync } from 'fs'
import handlebars from 'handlebars'
import path from 'path'
import { Model, Repository } from './../types'
import prettier from 'prettier'
import { MethodNames } from '../enums'
import { generateApiFiles } from './generateApiFiles'
export const generateService = (model: Model) => {
    const template = readFileSync(path.join(__dirname, '../../templates', 'service.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const idField = getFieldByName(model.fields, 'id')

    if (!idField) {
        throw new Error(`Model ${model.name} does not have an id field`)
    }
    const prismaTypeOfId = getFieldType(idField)
    if (!prismaTypeOfId) {
        throw new Error(`Model ${model.name} does not have an id field`)
    }
    const typeOfId = prismaTypeToTS(prismaTypeOfId)

    const templateParams: Repository = {
        name: model.name,
        lowercasedName: model.name.charAt(0).toLowerCase() + model.name.slice(1),
        methods: [
            {
                name: MethodNames.create,
                params: [`body: Prisma.${model.name}CreateInput`],
                prismaMethodParams: [
                    {
                        name: 'body',
                    },
                ],
            },
            {
                name: MethodNames.getById,
                params: ['id: ' + typeOfId],
                prismaMethodName: 'findUnique',
                prismaMethodParams: [
                    {
                        name: 'where',
                        value: {
                            id: 'id',
                        },
                    },
                ],
            },
            {
                name: MethodNames.findMany,
                params: [],
            },
            {
                name: MethodNames.update,
                params: ['id:' + typeOfId, `body: Prisma.${model.name}UpdateInput`],
                prismaMethodParams: [
                    {
                        name: 'body',
                    },
                    {
                        name: 'where',
                        value: {
                            id: 'id',
                        },
                    },
                ],
            },
            {
                name: MethodNames.delete,
                params: ['id:' + typeOfId],
                prismaMethodParams: [
                    {
                        name: 'where',
                        value: {
                            id: 'id',
                        },
                    },
                ],
            },
        ],
    }

    const compiledTemplate = prettier.format(templateCompiler(templateParams), { parser: 'typescript' })

    writeFile(`services/${model.name}Service.ts`, compiledTemplate)
    generateApiFiles(model, templateParams)
    return templateCompiler
}
