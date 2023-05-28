import { readFileSync } from 'fs'
import { Model, Repository } from '../types'
import handlebars from 'handlebars'
import prettier from 'prettier'
import path from 'path'
import { makePlural, writeFile } from '.'

export const generateApiFile = (model: Model, templateParams: Repository, fileName: string) => {
    const template = readFileSync(path.join(__dirname, '../../templates', 'endpoint.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const compiledTemplate = prettier.format(templateCompiler(templateParams), { parser: 'typescript' })
    writeFile(`pages/api/${makePlural(model.name.toLowerCase())}/${fileName}.ts`, compiledTemplate)

    return compiledTemplate
}
