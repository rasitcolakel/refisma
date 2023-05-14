import { readFileSync } from 'fs'
import { Model, Repository } from '../types'
import handlebars from 'handlebars'
import prettier from 'prettier'
import path from 'path'
import { writeFile } from '.'

export const generateZodFile = (model: Model, templateParams: Repository) => {
    console.log('generateZodFile', templateParams)
    const template = readFileSync(path.join(__dirname, '../../templates', 'zodSchemas.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const compiledTemplate = prettier.format(templateCompiler(templateParams), { parser: 'typescript' })
    writeFile(`schemas/${model.name.toLowerCase()}.ts`, compiledTemplate)

    return compiledTemplate
}
