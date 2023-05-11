import { writeFile } from './../utils'
import { readFileSync } from 'fs'
import handlebars from 'handlebars'
import path from 'path'
import { Model, Repository } from './../types'
import prettier from 'prettier'
export const generateService = (model: Model) => {
    const template = readFileSync(path.join(process.cwd(), 'src', 'templates', 'service.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const templateParams: Repository = {
        name: model.name,
        lowercasedName: model.name.toLowerCase(),
        methods: [
            {
                name: 'create',
                params: [`data: Prisma.${model.name}UpdateInput`],
                prismaMethodParams: [
                    {
                        name: 'data',
                    },
                ],
            },
            {
                name: 'getById',
                params: ['id: string'],
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
                name: 'get',
                params: [],
            },
            {
                name: 'update',
                params: ['id: string', `data: Prisma.${model.name}UpdateInput`],
                prismaMethodParams: [
                    {
                        name: 'data',
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
                name: 'delete',
                params: ['id: string'],
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

    writeFile(`services/${model.name}.service.ts`, compiledTemplate)
    return templateCompiler
}
