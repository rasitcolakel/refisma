import { UIFrameworks } from '@refinedev/cli'
import { Model } from '../types'
import path from 'path'
import { readFileSync } from 'fs'
import handlebars from 'handlebars'
import { makePlural, writeFile } from '.'
import prettier from 'prettier'
import ora from 'ora'

const inferencerPath = path.join(__dirname, '../../templates/refine/inferencer')

export enum UIFrameworksUpper {
    antd = 'Antd',
    mui = 'Mui',
    mantine = 'Mantine',
    'chakra-ui' = 'ChakraUI',
}

export const generateInferencerFiles = async (model: Model, UIFramework: UIFrameworks) => {
    const template = readFileSync(path.join(inferencerPath, 'index.ts.hbs'), 'utf-8')
    const templateCompiler = handlebars.compile(template)

    const files = [
        {
            type: 'List',
            name: 'list',
            filePath: 'index.tsx',
        },
        {
            type: 'Show',
            name: 'show',
            filePath: 'show/[id].tsx',
        },
        {
            type: 'Create',
            name: 'create',
            filePath: 'create/index.tsx',
        },
        {
            type: 'Edit',
            name: 'edit',
            filePath: 'edit/[id].tsx',
        },
    ]

    for (const file of files) {
        const spinner = ora(`Generating ${file.name} page`).start()
        spinner.indent = 5
        const compiledTemplate = prettier.format(
            templateCompiler({
                type: file.type,
                name: model.name,
                frameworkName: UIFramework,
                upperCaseFrameworkName: UIFrameworksUpper[UIFramework],
            }),
            { parser: 'typescript' },
        )
        writeFile(`pages/${makePlural(model.name.toLowerCase())}/${file.filePath}`, compiledTemplate)
        spinner.succeed(`Generated ${file.name} page`)
    }
}
