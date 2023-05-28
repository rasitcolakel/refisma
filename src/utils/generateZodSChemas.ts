import { readFileSync } from 'fs'
import { Model, Repository } from '../types'
import handlebars from 'handlebars'
import prettier from 'prettier'
import path from 'path'
import { makePlural, writeFile } from '.'
handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return arg1 == arg2 ? options.fn(this) : options.inverse(this)
})
export const generateZodFile = (model: Model, templateParams: Repository) => {
    const template = readFileSync(path.join(__dirname, '../../templates', 'zodSchemas.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const compiledTemplate = prettier.format(templateCompiler(templateParams), { parser: 'typescript' })
    writeFile(`schemas/${makePlural(model.name)}Schema.ts`, compiledTemplate)

    return compiledTemplate
}
