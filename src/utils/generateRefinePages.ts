import { readFileSync } from 'fs'
import { Model, Repository } from '../types'
import handlebars from 'handlebars'
import prettier from 'prettier'
import path from 'path'
import { excludeRelationFields, writeFile } from '.'

const refineTemplatesPath = path.join(__dirname, '../../templates/refine')

handlebars.registerPartial('columns', readFileSync(path.join(refineTemplatesPath, 'list/columns.ts.hbs'), 'utf-8'))

handlebars.registerPartial('imports', readFileSync(path.join(refineTemplatesPath, 'list/imports.ts.hbs'), 'utf-8'))

export const generateRefinePage = (model: Model, templateParams: Repository, fileName: string) => {
    const template = readFileSync(path.join(refineTemplatesPath, 'list.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const compiledTemplate = prettier.format(
        templateCompiler({ ...model, excludedModels: excludeRelationFields(model.fields) }),
        { parser: 'typescript' },
    )
    writeFile(`pages/${model.name.toLowerCase()}/${fileName}.tsx`, compiledTemplate)

    return compiledTemplate
}
