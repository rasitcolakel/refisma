// read models from  prisma/schema.prisma

import { promises } from 'fs'
import { Field, FieldVisibility, KeyOf, Model, PrismaRelationArgs } from '../types'
import { PrismaScalarTypes, TPrismaScalarTypes } from '../enums'
import { relationMapper } from '.'

type GetModelsType = {
    models: Model[]
    isRefisma: boolean
}
export const getModels = async (): Promise<GetModelsType> => {
    // check refisma file exists
    try {
        await promises.access('prisma/schema.refisma')

        const schema = await promises.readFile('prisma/schema.refisma', 'utf-8')
        return {
            models: parseSchema(schema, true),
            isRefisma: true,
        }
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            try {
                await promises.access('prisma/schema.prisma')
                const schema = await promises.readFile('prisma/schema.prisma', 'utf-8')
                return {
                    models: parseSchema(schema, false),
                    isRefisma: false,
                }
            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    throw new Error('schema.prisma not found')
                }
                throw error
            }
        }
        throw error
    }
}

export const parseSchema = (schema: string, isRefisma: boolean): Model[] => {
    const models: Model[] = []

    const lines = schema.split('\n')
    let model: Model | undefined = undefined

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.startsWith('//') || line.trim().startsWith('@')) continue
        if (line.startsWith('enum ')) continue
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
                const field = parseField(line, isRefisma)
                model.fields.push(field)
            }
        }
    }

    return models.map((model) => {
        return {
            ...model,
            fields: [...relationMapper(model.fields, models)],
        }
    })
}

const parseField = (line: string, isRefisma: boolean): Field => {
    // replace all spaces with a single space
    const arrayLine = line.replace(/\s+/g, ' ').trim()

    const [name, type, ...options] = arrayLine.split(' ') as string[]
    const relationOptions = arrayLine.split('@relation')[1]
    const relation: PrismaRelationArgs = {}
    let staticRelationName = ''
    if (relationOptions) {
        const relationArgs = relationOptions
            .replace('(', '')
            .replace(')', '')
            .split(',')
            .map((arg) => arg.trim().replaceAll('"', ''))
        relationArgs.forEach((arg) => {
            const [key, value] = arg.split(':') as [KeyOf<PrismaRelationArgs>, string]
            if (key && value) {
                if (key === 'fields') {
                    relation[key] = value
                        .trim()
                        .replace('[', '')
                        .replace(']', '')
                        .split(',')
                        .map((field) => field.trim())
                } else {
                    relation[key] = value.replace('[', '').replace(']', '').trim()
                }
            } else {
                staticRelationName = key
            }
        })
    }

    const isList = type.endsWith('[]')
    const isRelation =
        relation.fields && relation.fields.length > 0 && relation.references
            ? true
            : !PrismaScalarTypes[(isList ? type.replace('[]', '') : type.replace('?', '')) as TPrismaScalarTypes]
    const customListType =
        isList && !PrismaScalarTypes[(isList ? type.replace('[]', '') : type.replace('?', '')) as TPrismaScalarTypes]
    const isRequired = !type.includes('?')
    const isUnique = options.includes('@unique')
    const isId = options.includes('@id')
    const isUpdatedAt = options.includes('@updatedAt')
    const isCreatedAt = options.includes('@createdAt')
    const isReadOnly = options.includes('@readOnly')
    const isGenerated = options.includes('@generated')
    const visibility: FieldVisibility = {
        all: true,
        list: true,
        show: true,
        edit: true,
        create: true,
    }
    if (isRefisma) {
        /*
         * @visibility[all] -> default
         * @visibility[hidden] -> hide everywhere
         * @visibility[list, show] -> show in list and show
         * */

        const visibilityOptions = options.find((option) => option.startsWith('@visibility'))
        if (visibilityOptions) {
            const visibilityArgs = visibilityOptions
                .split('@visibility')[1]
                .split(',')[0]
                .replace('(', '')
                .replace(')', '')
                .split(',') as KeyOf<
                typeof visibility & {
                    all: boolean
                    hidden: boolean
                }
            >[]
            if (visibilityArgs.includes('hidden')) {
                visibility.all = false
                visibility.show = false
                visibility.list = false
                visibility.edit = false
                visibility.create = false
            } else visibility.all = false
            visibility.show = false
            visibility.list = false
            visibility.edit = false
            visibility.create = false
            visibilityArgs.forEach((arg) => {
                if (arg === 'all' || arg === 'hidden') {
                    return
                }

                visibility[arg] = true
            })
        }
    }

    return {
        name,
        staticRelationName,
        type: type as TPrismaScalarTypes,
        isList,
        isRelation,
        relation,
        isRequired: customListType ? false : isRequired,
        isUnique,
        isId,
        isUpdatedAt,
        isCreatedAt,
        isReadOnly,
        isGenerated,
        visibility,
    }
}
