import { UIFrameworks } from '@refinedev/cli'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { Field } from '../types'
import { PrismaScalarTypes, TPrismaScalarTypes } from '../enums'
import { ZodModel } from '../types'

export const getPackageJson = (): any => {
    if (!existsSync('package.json')) {
        throw new Error('./package.json not found')
    }

    return JSON.parse(readFileSync('package.json', 'utf8'))
}

export const getDependencies = (): string[] => {
    const { dependencies, devDependencies } = getPackageJson()

    return [...Object.keys(dependencies || {}), ...Object.keys(devDependencies || {})]
}

export const getUIFramework = (): UIFrameworks | undefined => {
    // read dependencies from package.json
    const dependencies = getDependencies()

    // check for antd
    if (dependencies.includes('@refinedev/antd')) {
        return UIFrameworks.ANTD
    }

    // check for mui
    if (dependencies.includes('@refinedev/mui')) {
        return UIFrameworks.MUI
    }

    // check for chakra
    if (dependencies.includes('@refinedev/chakra-ui')) {
        return UIFrameworks.CHAKRA
    }

    // check for mantine
    if (dependencies.includes('@refinedev/mantine')) {
        return UIFrameworks.MANTINE
    }

    return UIFrameworks.MUI
}

export const checkFolderExists = (p: string) => {
    if (!existsSync(path.join(process.cwd(), p))) {
        mkdirSync(path.join(process.cwd(), p))
    }
}

export const writeFile = (filePath: string, content: string) => {
    const folders = filePath.split('/').slice(0, -1)
    for (let i = 0; i < folders.length; i++) {
        const folder = folders.slice(0, i + 1).join('/')
        checkFolderExists(folder)
    }

    writeFileSync(path.join(process.cwd(), filePath), content)
}

export const getFieldByName = (fields: Field[], name: string) => {
    return fields.find((field) => field.name === name)
}

export const getFieldType = (field: Field): TPrismaScalarTypes | undefined => {
    if (field.type && PrismaScalarTypes[field.type]) {
        return field.type
    }
}

export const prismaTypeToTS = (type: TPrismaScalarTypes) => {
    if (type === PrismaScalarTypes.Int) return 'number'
    if (type === PrismaScalarTypes.String) return 'string'
    if (type === PrismaScalarTypes.Boolean) return 'boolean'
    if (type === PrismaScalarTypes.DateTime) return 'Date'
    if (type === PrismaScalarTypes.Json) return 'any'
    if (type === PrismaScalarTypes.Bytes) return 'any'
    if (type === PrismaScalarTypes.Decimal) return 'number'
    if (type === PrismaScalarTypes.BigInt) return 'number'
    if (type === PrismaScalarTypes.Float) return 'number'
    if (type === PrismaScalarTypes.Unsupported) return 'any'
}

export const findIdField = (fields: Field[]): Field => {
    return fields.find((field) => field.isId) as Field
}

export const generateZodSchema = (fields: Field[]): ZodModel[] => {
    const schema = fields
        .filter((field) => !field.isList && !field.isRelation)
        .map((field) => {
            return {
                name: field.name,
                type: prismaTypeToZod(field.type.replace('?', '') as TPrismaScalarTypes),
                required: field.isRequired,
                optional: field.isOptional,
                id: field.isId,
            }
        })

    return schema
}

export const prismaTypeToZod = (type: TPrismaScalarTypes) => {
    switch (type) {
        case PrismaScalarTypes.Int:
        case PrismaScalarTypes.BigInt:
        case PrismaScalarTypes.Float:
        case PrismaScalarTypes.Decimal:
            return 'number'
        case PrismaScalarTypes.String:
            return 'string'
        case PrismaScalarTypes.Boolean:
            return 'boolean'
        case PrismaScalarTypes.DateTime:
            return 'date'
        case PrismaScalarTypes.Json:
            return 'any'
        case PrismaScalarTypes.Bytes:
            return 'any'
        case PrismaScalarTypes.Unsupported:
            return 'any'
        default:
            return 'any'
    }
}
