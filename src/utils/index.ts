import { UIFrameworks } from '@refinedev/cli'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { Element, Field, FormField, Model } from '../types'
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

export const getFieldByType = (fields: Field[], type: string) => {
    return fields.find((field) => field.type === type)
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

export const excludeRelationFields = (fields: Field[]): Field[] => {
    return fields.filter((field) => !field.isList && !field.isRelation)
}

export const generateShowFields = (fields: Field[]): Field[] => {
    const excludeFields: string[] = []
    console.log(
        'fields',
        fields.map((field) => field.name),
    )
    const _fields = fields.map((field) => {
        if (field.isList && field.isRelation) {
            excludeFields.push(field.name)
            return field
        }
        if (field.relation && field.relatedModel) {
            let newName = ''
            if (field.relation.type) {
                excludeFields.push(field.relation.type?.toLowerCase().replace('?', '').replace('[]', ''))
                const fieldByType = getFieldByType(fields, field.relation.type)
                if (fieldByType) {
                    newName += fieldByType.name
                    excludeFields.push(fieldByType.name)
                }
            } else {
                newName += field.relatedModel.name.toLowerCase()
            }

            const isRelationOptional = field.relation.type?.includes('?')
            const requiredFields = excludeIdField(
                excludeRelationFields(getAllRequiredFields(field.relatedModel.fields)),
            )

            if (isRelationOptional) {
                newName += '?'
            }

            if (requiredFields.length) {
                newName += '.' + requiredFields[0].name
            } else {
                const id = getIdField(field.relatedModel.fields)
                if (id) {
                    newName += '.' + id.name
                }
            }
            field.showName = newName
        } else {
            field.showName = field.name
        }

        return field
    })
    return _fields.filter((field) => !excludeFields.includes(field.name))
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

export const mergeSameImports = (imports: string[][]) => {
    const mergedImports: string[][] = []
    imports.forEach((importItem) => {
        if (importItem[2] === 'true') {
            mergedImports.push(importItem)
            return
        }
        const existingImport = mergedImports.find((item) => item[1] === importItem[1])
        if (existingImport) {
            existingImport[0] = `${existingImport[0]}, ${importItem[0]}`
        } else {
            mergedImports.push(importItem)
        }
    })
    return mergedImports
}

export const fieldToFormElement = (field: Field): Element => {
    const type = field.type.replace('?', '') as TPrismaScalarTypes
    if (field.relation.fields?.length) return 'autocomplete'
    if (type === PrismaScalarTypes.Int) return 'number'
    if (type === PrismaScalarTypes.String) return 'text'
    if (type === PrismaScalarTypes.Boolean) return 'checkbox'
    if (type === PrismaScalarTypes.DateTime) return 'date'
    if (type === PrismaScalarTypes.Json) return 'text'
    if (type === PrismaScalarTypes.Bytes) return 'text'
    if (type === PrismaScalarTypes.Decimal) return 'number'
    if (type === PrismaScalarTypes.BigInt) return 'number'
    if (type === PrismaScalarTypes.Float) return 'number'
    if (type === PrismaScalarTypes.Unsupported) return 'text'
    return 'text'
}

export const fieldsToFormElements = (fields: Field[]): FormField[] => {
    return fields.map((field) => {
        return {
            ...field,
            elementType: fieldToFormElement(field),
        }
    })
}

export const relationMapper = (fields: Field[], models: Model[]): Field[] => {
    const relations = getSingleRelationFields(fields)
    if (!relations.length) return fields
    return fields.map((field) => {
        const checkRelationsHasReference = relations.find(
            (r) => r.relation && r.relation.fields && r.relation?.fields.includes(field.name),
        )
        if (checkRelationsHasReference) {
            const relatedModel = models.find(
                (m) => m.name === checkRelationsHasReference.type.replace('?', '').replace('[]', ''),
            )
            if (!relatedModel) return field
            return {
                ...field,
                relation: { ...checkRelationsHasReference.relation, type: checkRelationsHasReference.type },
                relatedModel,
            }
        }
        return field
    })
}

export const getSingleRelationFields = (fields: Field[]) => {
    return fields.filter((field) => field.isRelation && !field.isList)
}

export const getAllRequiredFields = (fields: Field[]) => {
    return fields.filter((field) => field.isRequired)
}

export const excludeIdField = (fields: Field[]) => {
    return fields.filter((field) => !field.isId)
}

export const getIdField = (fields: Field[]) => {
    return fields.find((field) => field.isId)
}

export const excludeNonRequiredFields = (fields: Field[]) => {
    return fields.filter((field) => field.isRequired)
}
