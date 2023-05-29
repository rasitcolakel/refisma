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
    getRelationFieldsWithCustomTypes,
    getSingleRelationFields,
    makePlural,
    manyToManyRelations,
    mergeSameImports,
    writeFile,
} from '.'
import {
    generateFormFields,
    generateImportsForForm,
    generateImportsForView,
    generateRelationFormDependencies,
    generateShowProps,
} from './generateFormFields'
import { UIFrameworks } from '@refinedev/cli'

const refineTemplatesPath = path.join(__dirname, '../../templates/refine')

handlebars.registerPartial('columns', readFileSync(path.join(refineTemplatesPath, 'list/columns.ts.hbs'), 'utf-8'))

handlebars.registerPartial('imports', readFileSync(path.join(refineTemplatesPath, 'list/imports.ts.hbs'), 'utf-8'))
handlebars.registerPartial(
    'manyToManyMapper',
    readFileSync(path.join(refineTemplatesPath, 'common/manyToManyMapper.ts.hbs'), 'utf-8'),
)

handlebars.registerPartial(
    'getServerSideProps',
    readFileSync(path.join(refineTemplatesPath, '/common/getServerSideProps.ts.hbs'), 'utf-8'),
)

handlebars.registerPartial(
    'renderShow',
    readFileSync(path.join(refineTemplatesPath, '/show/renderShow.ts.hbs'), 'utf-8'),
)

handlebars.registerHelper('makeCapital', (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase())

handlebars.registerHelper('isArray', function (arg1: string, options) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Array.isArray(arg1) || arg1.includes(',') ? options.fn(this) : options.inverse(this)
})

const listImports = (model: Model) => [
    ['React', 'react', 'true'],
    [model.name, '@prisma/client'],
    ['useTranslate', '@refinedev/core'],
    ['GetServerSideProps', 'next'],
    ['serverSideTranslations', 'next-i18next/serverSideTranslations'],
]

export const generateRefineListPage = (model: Model, templateParams: Repository) => {
    const template = readFileSync(path.join(refineTemplatesPath, 'list.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const imports = [...listImports(model), ...generateImportsForView(UIFrameworks.MUI, false)]

    const compiledTemplate = prettier.format(
        templateCompiler({
            ...templateParams,
            ...model,
            excludedModels: excludeRelationFields(model.fields),
            actions: true,
            idField: findIdField(model.fields).name,
            imports: mergeSameImports(imports),
        }),
        { parser: 'typescript' },
    )
    writeFile(`pages/${makePlural(model.name.toLowerCase())}/index.tsx`, compiledTemplate)

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
    const template = readFileSync(path.join(refineTemplatesPath, 'create.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)
    const formElements = fieldsToFormElements(model.fields.filter((field) => !field.isId && !field.isRelation))
    const manyToManyFields = fieldsToFormElements(manyToManyRelations(model.fields)) || null
    const formFields = generateFormFields([...formElements, ...manyToManyFields], model, UIFrameworks.MUI, type)
    const formImports = generateImportsForForm(formElements, UIFrameworks.MUI, type)
    const imports = [...createImports(model), ...formImports]
    const relations = getSingleRelationFields(model.fields)
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

    if (manyToManyFields) {
        imports.push(['GetListResponse', '@refinedev/core'])
        imports.push(['Prisma', '@prisma/client'])
        for (const field of manyToManyFields) {
            imports.push([field.type.replace('[]', '').replace('?', ''), '@prisma/client'])
        }
    }
    const relationFields = generateRelationFormDependencies([...relations, ...manyToManyFields], type, model)

    const compiledTemplate = prettier.format(
        templateCompiler({
            ...templateParams,
            ...model,
            excludedModels: excludeRelationFields(model.fields),
            actions: true,
            idField: findIdField(model.fields).name,
            imports: mergeSameImports(imports),
            formFields: formFields,
            relationFields,
            manyToManyRelations: manyToManyFields,
            action: type,
        }),
        { parser: 'typescript' },
    )
    if (type === 'create') {
        writeFile(`pages/${makePlural(model.name.toLowerCase())}/create/index.tsx`, compiledTemplate)
    } else {
        writeFile(`pages/${makePlural(model.name.toLowerCase())}/edit/[id].tsx`, compiledTemplate)
    }

    return compiledTemplate
}

const showImports = (model: Model) => [
    ['React', 'react', 'true'],
    ['useTranslate', '@refinedev/core'],
    ['GetServerSideProps', 'next'],
    ['serverSideTranslations', 'next-i18next/serverSideTranslations'],
    ['useShow', '@refinedev/core'],
    [`${model.name}Select`, `@services/${makePlural(model.name)}Service`],
]

export const generateRefineShowPage = (model: Model, templateParams: Repository) => {
    const template = readFileSync(path.join(refineTemplatesPath, 'show.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)
    const formFields = generateFormFields(
        fieldsToFormElements(model.fields.filter((field) => !field.isId && !field.isRelation)),
        model,
        UIFrameworks.MUI,
    )
    const imports = [...showImports(model), ...generateImportsForView(UIFrameworks.MUI, true)]
    const initialResources = generateShowProps(model.fields, model)
    imports.push(['GetOneResponse', '@refinedev/core'])
    imports.push(['axiosInstance', '@refinedev/simple-rest'])
    imports.push(['dataProvider', '@refinedev/simple-rest', 'true'])
    const compiledTemplate = prettier.format(
        templateCompiler({
            ...templateParams,
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
    writeFile(`pages/${makePlural(model.name.toLowerCase())}/show/[id].tsx`, compiledTemplate)

    return compiledTemplate
}
