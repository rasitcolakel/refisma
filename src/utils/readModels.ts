// read models from  prisma/schema.prisma

import { readFileSync } from 'fs'
import { Field, KeyOf, Model, PrismaRelationArgs } from '../types'
import { PrismaScalarTypes, TPrismaScalarTypes } from '../enums'
import { relationMapper } from '.'

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
                const field = parseField(line)
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

const parseField = (line: string): Field => {
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
    const isRequired = !type.includes('?')
    const isUnique = options.includes('@unique')
    const isId = options.includes('@id')
    const isUpdatedAt = options.includes('@updatedAt')
    const isCreatedAt = options.includes('@createdAt')
    const isOptional = type.includes('?')
    const isReadOnly = options.includes('@readOnly')
    const isGenerated = options.includes('@generated')

    return {
        name,
        staticRelationName,
        type: type as TPrismaScalarTypes,
        isList,
        isRelation,
        relation,
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
