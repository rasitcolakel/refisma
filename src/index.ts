import { prompt } from 'enquirer'
import chalk from 'chalk'
import { getUIFramework } from './utils'
import { getModels } from './utils/readModels'
import { generateService } from './utils/generateService'
import ora from 'ora'
import { readSwagger } from './utils/readSwagger'

type Args = {
    file?: string
    type?: 'prisma' | 'swagger'
}

export const main = async () => {
    const { models, isRefisma } = await getModels()

    const uiFramework = getUIFramework()
    if (!uiFramework) {
        console.log(chalk.red('No UI framework detected.'))
        process.exit(1)
    }
    const file = getArg('--file') || getArg('-f') || 'schema.prisma'
    const type = getArg('--type') || getArg('-t') || 'prisma'
    console.log(chalk.green(`Generating ${uiFramework} pages from ${file}`))
    if (type === 'swagger') {
        readSwagger(file)
    } else {
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

        for (const model of selectedModels) {
            const spinner = ora(`Generating ${model.name} service`).start()
            await generateService(model, uiFramework)
            spinner.succeed(`Generated pages for ${model.name}`)
        }
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

const getArgs = () => {
    const args = process.argv.slice(2)
    return args
}

const getArg = (arg: string) => {
    const args = getArgs()
    const index = args.findIndex((a) => a.startsWith(arg))
    if (index === -1) {
        return null
    }
    const value = args[index]
    return value.trim().replace(arg + '=', '')
}
