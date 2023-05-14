import { prompt } from 'enquirer'
import chalk from 'chalk'
import { getUIFramework } from './utils'
import { getModels } from './utils/readModels'
import { generateService } from './utils/generateService'
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
