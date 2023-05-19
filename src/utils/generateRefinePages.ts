import { readFileSync } from 'fs'
import { Model, Repository } from '../types'
import handlebars from 'handlebars'
import prettier from 'prettier'
import path from 'path'
import { excludeRelationFields, fieldsToFormElements, findIdField, mergeSameImports, writeFile } from '.'

const refineTemplatesPath = path.join(__dirname, '../../templates/refine')

handlebars.registerPartial('columns', readFileSync(path.join(refineTemplatesPath, 'list/columns.ts.hbs'), 'utf-8'))

handlebars.registerPartial('imports', readFileSync(path.join(refineTemplatesPath, 'list/imports.ts.hbs'), 'utf-8'))

handlebars.registerPartial(
    'getServerSideProps',
    readFileSync(path.join(refineTemplatesPath, '/common/getServerSideProps.ts.hbs'), 'utf-8'),
)

handlebars.registerHelper('isArray', function (arg1: string, options) {
    console.log('isArray', arg1, Array.isArray(arg1))

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Array.isArray(arg1) || arg1.includes(',') ? options.fn(this) : options.inverse(this)
})

const listImports = (model: Model) => [
    ['React', 'react', 'true'],
    ['DataGrid', '@mui/x-data-grid'],
    ['GridColumns', '@mui/x-data-grid'],
    [model.name, '@prisma/client'],
    ['useTranslate', '@refinedev/core'],
    ['DeleteButton', '@refinedev/mui'],
    ['EditButton', '@refinedev/mui'],
    ['List', '@refinedev/mui'],
    ['ShowButton', '@refinedev/mui'],
    ['useDataGrid', '@refinedev/mui'],
    ['GetServerSideProps', 'next'],
    ['serverSideTranslations', 'next-i18next/serverSideTranslations'],
]

export const generateRefineListPage = (model: Model, templateParams: Repository) => {
    const template = readFileSync(path.join(refineTemplatesPath, 'list.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const imports = listImports(model)

    const compiledTemplate = prettier.format(
        templateCompiler({
            ...model,
            excludedModels: excludeRelationFields(model.fields),
            actions: true,
            idField: findIdField(model.fields).name,
            imports: mergeSameImports(imports),
        }),
        { parser: 'typescript' },
    )
    writeFile(`pages/${model.name.toLowerCase()}/index.tsx`, compiledTemplate)

    return compiledTemplate
}

const createImports = (model: Model) => [
    ['React', 'react', 'true'],
    ['useTranslate', '@refinedev/core'],
    ['Create', '@refinedev/mui'],
    ['GetServerSideProps', 'next'],
    ['serverSideTranslations', 'next-i18next/serverSideTranslations'],
    [model.name, '@prisma/client'],
    ['useForm', '@refinedev/react-hook-form'],
    ['TextField', '@mui/material'],
]

export const generateRefineCreatePage = (model: Model, templateParams: Repository) => {
    const template = readFileSync(path.join(refineTemplatesPath, 'create.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const imports = createImports(model)
    const compiledTemplate = prettier.format(
        templateCompiler({
            ...model,
            excludedModels: excludeRelationFields(model.fields),
            actions: true,
            idField: findIdField(model.fields).name,
            imports: mergeSameImports(imports),
            formFields: fieldsToFormElements(model.fields.filter((field) => !field.isId && !field.isRelation)),
        }),
        { parser: 'typescript' },
    )
    writeFile(`pages/${model.name.toLowerCase()}/create/index.tsx`, compiledTemplate)

    return compiledTemplate
}
