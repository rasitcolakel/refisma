import { prompt } from 'enquirer'
import chalk from 'chalk'
import { getUIFramework } from './utils'
import { getModels } from './utils/readModels'
import { generateService } from './utils/generateService'
import ora from 'ora'

export const main = async () => {
    const { models, isRefisma } = await getModels()
    const response = (await prompt({
        type: 'multiselect',
        name: 'model',
        message: 'Which resources are you trying to create?',
        choices: models.map((model) => model.name),
    })) as { model: string[] }

    const selectedModels = models.filter((model) => response.model.includes(model.name))

    if (!selectedModels) {
        process.exit(1)
    }

    const uiFramework = getUIFramework()
    if (!uiFramework) {
        console.log(chalk.red('No UI framework detected.'))
        process.exit(1)
    }

    for (const model of selectedModels) {
        const spinner = ora(`Generating ${model.name} service`).start()
        await generateService(model, uiFramework)
        spinner.succeed(`Generated pages for ${model.name}`)
    }
}

export const validateSchema = (schema: any) => {
    return async (req: any, res: any, next: any) => {
        try {
            const parsed = await schema.parseAsync(req)
            if (parsed.query) {
                req.query = parsed.query
            }
            if (parsed.body) {
                req.body = parsed.body
            }
            next(req, res)
        } catch (error: any) {
            res.status(400).json({ error })
        }
    }
}
