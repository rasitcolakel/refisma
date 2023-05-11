import { prompt } from 'enquirer'
import chalk from 'chalk'
import { getUIFramework } from './utils'
import { getModels } from './utils/readModels'
import { generateService } from './utils/generateService'
import { generateApiFiles } from './utils/generateApiFiles'
export const main = async () => {
    const models = getModels()
    const response = (await prompt({
        type: 'multiselect',
        name: 'model',
        message: 'Which resources are you trying to create?',
        choices: models.map((model) => model.name),
    })) as { model: string[] }

    const selectedModels = models.filter((model) => response.model.includes(model.name))

    if (!selectedModels) {
        console.log(chalk.red('No models selected'))
        process.exit(1)
    }

    const uiFramework = getUIFramework()

    for (const model of selectedModels) {
        generateService(model)
        generateApiFiles(model)
    }
}

main()
