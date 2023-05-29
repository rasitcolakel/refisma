import { findIdField, generateZodSchema, makePlural, prismaTypeToTS, writeFile } from './../utils'
import { readFileSync } from 'fs'
import handlebars from 'handlebars'
import path from 'path'
import { Model, Repository } from './../types'
import prettier from 'prettier'
import { MethodNames } from '../enums'
import { generateApiFile } from './generateApiFiles'
import { generateZodFile } from './generateZodSChemas'
import { generateRefineFormPage, generateRefineListPage, generateRefineShowPage } from './generateRefinePages'
import { UIFrameworks } from '@refinedev/cli'
import ora from 'ora'
import chalk from 'chalk'

// create or for if statements in handlebars

handlebars.registerHelper('ifOr' as any, function (arg1, arg2, options) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return arg1 || arg2 ? options.fn(this) : options.inverse(this)
})

handlebars.registerHelper('ifNot' as any, function (arg1, arg2, options) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return !arg1 ? options.fn(this) : options.inverse(this)
})

handlebars.registerHelper('ifAnd' as any, function (arg1, arg2, options) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return arg1 && arg2 ? options.fn(this) : options.inverse(this)
})

handlebars.registerHelper('ifAndNot' as any, function (arg1, arg2, options) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return !arg1 && !arg2 ? options.fn(this) : options.inverse(this)
})

export const generateService = async (model: Model, UIFramework: UIFrameworks) => {
    const template = readFileSync(path.join(__dirname, '../../templates', 'service.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const idField = findIdField(model.fields)

    if (!idField) {
        throw new Error(`Model ${model.name} does not have an @id field`)
    }

    const typeOfId = prismaTypeToTS(idField.type)
    if (!typeOfId) {
        throw new Error(`Model ${model.name} does not have an @id field`)
    }

    const templateParams: Repository = {
        name: model.name,
        pluralizedName: makePlural(model.name),
        pluralizedNameLowercased: makePlural(model.name).toLowerCase(),
        lowercasedName: model.name.charAt(0).toLowerCase() + model.name.slice(1),
        methods: [
            {
                isSingular: false,
                method: 'POST',
                name: MethodNames.create,
                params: [
                    {
                        name: 'body',
                        type: `Prisma.${model.name}CreateInput`,
                        from: 'req.body',
                    },
                ],
                requestParams: [
                    {
                        name: 'body',
                        as: 'data',
                        type: `Prisma.${model.name}CreateInput`,
                    },
                ],
            },
            {
                isSingular: true,
                name: MethodNames.getById,
                method: 'GET',
                params: [
                    {
                        name: idField.name,
                        type: typeOfId,
                        from: 'req.query.' + idField.name,
                    },
                ],
                customName: 'findUnique',
                requestParams: [
                    {
                        name: 'query',
                        as: 'where',
                        values: [
                            {
                                name: idField.name,
                                type: typeOfId,
                            },
                        ],
                    },
                ],
            },
            {
                isSingular: false,
                method: 'GET',
                name: MethodNames.findMany,
                params: [],
                requestParams: [],
            },
            {
                isSingular: true,
                method: 'PATCH',
                name: MethodNames.update,
                params: [
                    {
                        name: idField.name,
                        type: typeOfId,
                        from: 'req.query.' + idField.name,
                    },
                    {
                        name: 'body',
                        type: `Prisma.${model.name}UpdateInput`,
                        from: 'req.body',
                    },
                ],
                requestParams: [
                    {
                        name: 'query',
                        as: 'where',
                        values: [
                            {
                                name: idField.name,
                                type: typeOfId,
                            },
                        ],
                    },
                    {
                        name: 'body',
                        type: `Prisma.${model.name}UpdateInput`,
                        as: 'data',
                    },
                ],
            },
            {
                isSingular: true,
                method: 'DELETE',
                name: MethodNames.delete,
                params: [
                    {
                        name: idField.name,
                        type: typeOfId,
                        from: 'req.query.' + idField.name,
                    },
                ],
                requestParams: [
                    {
                        name: 'query',
                        as: 'where',
                        values: [
                            {
                                name: idField.name,
                                type: typeOfId,
                            },
                        ],
                    },
                ],
            },
        ],
        fields: { ...model.fields },
        getCounts: model.fields.filter((field) => field.isList).map((field) => field.name).length > 0,
        zodSchema: generateZodSchema(model.fields),
    }
    const compiledTemplate = prettier.format(templateCompiler(templateParams), { parser: 'typescript' })

    writeFile(`services/${makePlural(model.name)}Service.ts`, compiledTemplate)
    generateZodFile(model, templateParams)
    // generate single file for all endpoints
    generateApiFile(
        model,
        {
            ...templateParams,
            methods: templateParams.methods.filter((method) => method.isSingular),
        },
        '[id]',
    )
    generateApiFile(
        model,
        {
            ...templateParams,
            methods: templateParams.methods.filter((method) => !method.isSingular),
        },
        'index',
    )

    if (UIFramework === UIFrameworks.MUI) {
        const spinner = ora(`Generating list page`).start()
        spinner.indent = 5
        generateRefineListPage(model, templateParams)
        spinner.succeed(`Generated list page`)

        const spinner2 = ora(`Generating create page`).start()
        spinner2.indent = 5
        generateRefineFormPage(model, templateParams, 'create')
        spinner2.succeed(`Generated create page`)

        const spinner3 = ora(`Generating edit page`).start()
        spinner3.indent = 5
        generateRefineFormPage(model, templateParams, 'edit')
        spinner3.succeed(`Generated edit page`)

        const spinner4 = ora(`Generating show page`).start()
        spinner4.indent = 5
        generateRefineShowPage(model, templateParams)
        spinner4.succeed(`Generated show page`)
    } else {
        console.log(chalk.yellow(`UI Framework ${UIFramework} is not supported yet`))
    }

    return templateCompiler
}
