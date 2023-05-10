// read models from  prisma/schema.prisma

import { readFileSync } from 'fs'

export const getModels = (): Model[] => {
    const schema = readFileSync('prisma/schema.prisma', 'utf-8')
    const models = parseSchema(schema)

    return models
}

export const parseSchema = (schema: string): Model[] => {
    const models: Model[] = []

    const lines = schema.split('\n')
    let model: Model | undefined = undefined

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.startsWith('//') || line.trim().startsWith('@')) continue
        if (line.startsWith('model ')) {
            const name = line.split(' ')[1]
            model = {
                name,
                fields: [],
            }
        }

        if (line.startsWith('}')) {
            if (model) {
                models.push(model)
                model = undefined
            }
        }

        if (line.startsWith('  ')) {
            if (model) {
                const field = parseField(line)
                model.fields.push(field)
            }
        }
    }

    return models
}

export type Model = {
    name: string
    fields: Field[]
}

export type Field = {
    name: string
    type: string
    isList: boolean
    isRequired: boolean
    isUnique: boolean
    isId: boolean
    isUpdatedAt: boolean
    isCreatedAt: boolean
    isOptional: boolean
    isReadOnly: boolean
    isGenerated: boolean
}

const parseField = (line: string): Field => {
    // replace all spaces with a single space
    const arrayLine = line.replace(/\s+/g, ' ').trim()

    const [name, type, ...options] = arrayLine.split(' ') as string[]
    console.log({ name, type, options })
    console.log('type of type', typeof type.startsWith)

    const isList = type.startsWith('[') && type.endsWith(']')
    const isRequired = type.endsWith('!')
    const isUnique = options.includes('@unique')
    const isId = options.includes('@id')
    const isUpdatedAt = options.includes('@updatedAt')
    const isCreatedAt = options.includes('@createdAt')
    const isOptional = options.includes('@optional')
    const isReadOnly = options.includes('@readOnly')
    const isGenerated = options.includes('@generated')

    return {
        name,
        type,
        isList,
        isRequired,
        isUnique,
        isId,
        isUpdatedAt,
        isCreatedAt,
        isOptional,
        isReadOnly,
        isGenerated,
    }
}