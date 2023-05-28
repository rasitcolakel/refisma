import { readFileSync } from 'fs'
import { Model, Repository } from '../types'
import handlebars from 'handlebars'
import prettier from 'prettier'
import path from 'path'
import {
    excludeRelationFields,
    fieldsToFormElements,
    findIdField,
    generateShowFields,
    getSingleRelationFields,
    mergeSameImports,
    writeFile,
} from '.'
import {
    generateFormFields,
    generateImportsForForm,
    generateRelationFormDependencies,
    generateShowProps,
} from './generateFormFields'
import { UIFrameworks } from '@refinedev/cli'

const refineTemplatesPath = path.join(__dirname, '../../templates/refine')

handlebars.registerPartial('columns', readFileSync(path.join(refineTemplatesPath, 'list/columns.ts.hbs'), 'utf-8'))

handlebars.registerPartial('imports', readFileSync(path.join(refineTemplatesPath, 'list/imports.ts.hbs'), 'utf-8'))

handlebars.registerPartial(
    'getServerSideProps',
    readFileSync(path.join(refineTemplatesPath, '/common/getServerSideProps.ts.hbs'), 'utf-8'),
)

handlebars.registerPartial(
    'renderShow',
    readFileSync(path.join(refineTemplatesPath, '/show/renderShow.ts.hbs'), 'utf-8'),
)

handlebars.registerHelper('isArray', function (arg1: string, options) {
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
    ['HttpError', '@refinedev/core'],
    ['GetServerSideProps', 'next'],
    ['serverSideTranslations', 'next-i18next/serverSideTranslations'],
    ['useForm', '@refinedev/react-hook-form'],
    ['Controller', 'react-hook-form'],
    [model.name, '@prisma/client'],
]

export const generateRefineFormPage = (
    model: Model,
    templateParams: Repository,
    type: 'create' | 'edit' = 'create',
) => {
    const template = readFileSync(path.join(refineTemplatesPath, type + '.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)
    const formElements = fieldsToFormElements(model.fields.filter((field) => !field.isId && !field.isRelation))
    const formFields = generateFormFields(formElements, model, UIFrameworks.MUI, type)
    const formImports = generateImportsForForm(formElements, UIFrameworks.MUI, type)
    const imports = [...createImports(model), ...formImports]
    const relations = getSingleRelationFields(model.fields)
    const relationFields = generateRelationFormDependencies(getSingleRelationFields(relations), type, model)
    console.log(type, relationFields[0])
    if (relations.length > 0) {
        imports.push(['axiosInstance', '@refinedev/simple-rest'])
        imports.push(['dataProvider', '@refinedev/simple-rest', 'true'])
        imports.push(['GetListResponse', '@refinedev/core'])
        if (type === 'edit') {
            imports.push(['GetOneResponse', '@refinedev/core'])
        }
        relations.forEach((f) => {
            imports.push([f.type.replace('[]', '').replace('?', ''), '@prisma/client'])
        })
    }
    const compiledTemplate = prettier.format(
        templateCompiler({
            ...model,
            excludedModels: excludeRelationFields(model.fields),
            actions: true,
            idField: findIdField(model.fields).name,
            imports: mergeSameImports(imports),
            formFields: formFields,
            relationFields,
        }),
        { parser: 'typescript' },
    )
    if (type === 'create') {
        writeFile(`pages/${model.name.toLowerCase()}/create/index.tsx`, compiledTemplate)
    } else {
        writeFile(`pages/${model.name.toLowerCase()}/edit/[id].tsx`, compiledTemplate)
    }

    return compiledTemplate
}

const showImports = (model: Model) => [
    ['React', 'react', 'true'],
    ['useTranslate', '@refinedev/core'],
    ['GetServerSideProps', 'next'],
    ['serverSideTranslations', 'next-i18next/serverSideTranslations'],
    ['useShow', '@refinedev/core'],
    ['Show', '@refinedev/mui'],
    ['Stack', '@mui/material'],
    ['Typography', '@mui/material'],
    [`${model.name}Select`, `@services/${model.name}Service`],
]

export const generateRefineShowPage = (model: Model, templateParams: Repository) => {
    const template = readFileSync(path.join(refineTemplatesPath, 'show.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)
    const formFields = generateFormFields(
        fieldsToFormElements(model.fields.filter((field) => !field.isId && !field.isRelation)),
        model,
        UIFrameworks.MUI,
    )
    const imports = showImports(model)
    const initialResources = generateShowProps(model.fields, model)
    imports.push(['GetOneResponse', '@refinedev/core'])
    imports.push(['axiosInstance', '@refinedev/simple-rest'])
    imports.push(['dataProvider', '@refinedev/simple-rest', 'true'])
    const compiledTemplate = prettier.format(
        templateCompiler({
            ...model,
            lowercasedName: model.name.charAt(0).toLowerCase() + model.name.slice(1),
            fields: generateShowFields(model.fields),
            actions: true,
            idField: findIdField(model.fields).name,
            imports: mergeSameImports(imports),
            formFields: formFields,
            initialResources,
        }),
        { parser: 'typescript' },
    )
    writeFile(`pages/${model.name.toLowerCase()}/show/[id].tsx`, compiledTemplate)

    return compiledTemplate
}
