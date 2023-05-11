import { readFileSync } from 'fs'
import { MethodNames } from '../enums'
import { Model } from '../types'
import handlebars from 'handlebars'
import prettier from 'prettier'
import path from 'path'
import { writeFile } from '.'

const endpointsWithId = [
    {
        name: MethodNames.GET_BY_ID,
        params: ['req.params.id'],
        method: 'get',
    },
    {
        name: MethodNames.UPDATE,
        params: ['req.params.id', `req.body`],
        method: 'put',
    },
    {
        name: MethodNames.DELETE,
        params: ['req.params.id'],
        method: 'delete',
    },
]

const endpointsWithoutId = [
    {
        name: MethodNames.GET,
        method: 'get',
    },
    {
        name: MethodNames.CREATE,
        params: ['req.body'],
        method: 'post',
    },
]

export const generateApiFiles = (model: Model) => {
    const templateParams: any = {
        name: model.name,
        lowercasedName: model.name.toLowerCase(),
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
        generateApiFile(model, { ...templateParams, endpoints: { ...file.params } }, file.name)
    })
}
export const generateApiFile = (model: Model, templateParams: any, fileName: string) => {
    const template = readFileSync(path.join(__dirname, '../../templates', 'endpoint.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const compiledTemplate = prettier.format(templateCompiler(templateParams), { parser: 'typescript' })
    writeFile(`pages/api/${model.name.toLowerCase()}/${fileName}.ts`, compiledTemplate)

    return compiledTemplate
}
