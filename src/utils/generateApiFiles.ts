import { readFileSync } from 'fs'
import { MethodNames, TMethodNames } from '../enums'
import { Model, Repository } from '../types'
import handlebars from 'handlebars'
import prettier from 'prettier'
import path from 'path'
import { writeFile } from '.'

const endpointsWithId = [
    {
        name: MethodNames.getById,
        params: ['req.query.id'],
        method: 'get',
    },
    {
        name: MethodNames.update,
        params: ['req.query.id', `req.body`],
        method: 'put',
    },
    {
        name: MethodNames.delete,
        params: ['req.query.id'],
        method: 'delete',
    },
]

const endpointsWithoutId = [
    {
        name: MethodNames.findMany,
        method: 'get',
    },
    {
        name: MethodNames.create,
        params: ['req.body'],
        method: 'post',
    },
]

export const generateApiFiles = (model: Model, repository: Repository) => {
    const templateParams = {
        name: model.name,
        lowercasedName: model.name.toLowerCase(),
        endpoints: {},
    }
    const files = [
        {
            name: '[id]',
            params: endpointsWithId,
        },
        {
            name: 'index',
            params: endpointsWithoutId,
        },
    ]

    files.map((file) => {
        const names = file.params.map((p) => p.name) as TMethodNames[]
        generateApiFile(
            model,
            {
                ...templateParams,
                endpoints: [...file.params],
                serviceMethods: repository.methods.filter((m) => names.includes(m.name)),
            },
            file.name,
        )
    })
}
export const generateApiFile = (model: Model, templateParams: any, fileName: string) => {
    const template = readFileSync(path.join(__dirname, '../../templates', 'endpoint.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const compiledTemplate = prettier.format(templateCompiler(templateParams), { parser: 'typescript' })
    writeFile(`pages/api/${model.name.toLowerCase()}/${fileName}.ts`, compiledTemplate)

    return compiledTemplate
}
