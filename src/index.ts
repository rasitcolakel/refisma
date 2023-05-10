import { prompt } from 'enquirer'
import chalk from 'chalk'
import { getUIFramework } from './utils'
import { getModels } from './utils/readModels'
import { generateApiEndpointsInNextjsForModel } from './utils/generateApiEndpoints'

export const main = async () => {
    const models = getModels()

    const response = (await prompt({
        type: 'select',
        name: 'model',
        message: 'Which resource name are you trying to create?',
        choices: models.map((model) => model.name),
    })) as { model: string }

    const model = models.find((model) => model.name === response.model)

    if (!model) {
        throw new Error(`Model ${response.model} not found`)
    }

    const uiFramework = getUIFramework()

    console.log(chalk.green(`Generating ${model.name} ${uiFramework} files in ${process.cwd()}`))
    generateApiEndpointsInNextjsForModel(model)
}

main()
