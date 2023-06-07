// read swagger with yamljs

import { readFileSync, promises } from 'fs'
import { parse } from 'yamljs'
import { Model, Field, FieldVisibility, KeyOf, PrismaRelationArgs } from '../types'
import { TPrismaScalarTypes } from '../enums'

type GetModelsType = {
    models: Model[] & {
        fields: SwaggerField[]
    }
    isRefisma: boolean
}

type SwaggerModel = {
    name: string
    fields: SwaggerField[]
}

type SwaggerField = Pick<Field, 'name' | 'type' | 'isList' | 'isRelation' | 'isRequired'> & {
    relation: SwaggerModel
}

export const readSwagger = async (file: string) => {
    try {
        await promises.access(file)

        const schema = await promises.readFile(file, 'utf-8')

        const parsed = parse(schema)

        const schemas = getSchemas(parsed)
        const paths = getPaths(parsed)
        const models = schemas.map((schema) => {
            const model: SwaggerModel = {
                name: schema,
                fields: [],
            }

            const properties = getProperties(parsed, schema)
            const requiredFields = parsed.components.schemas[schema].required

            model.fields = Object.keys(properties).map((property) => {
                const field: Partial<SwaggerField> = generateSwaggerField(property, properties)
                field.isRequired = requiredFields ? requiredFields.includes(property) : false
                const checkRef = properties[property].$ref && properties[property].$ref.includes('components/schemas')
                if (checkRef) {
                    const name = properties[property].$ref.split('/')[3]
                    const refProperties = getProperties(parsed, name)
                    const refRequiredFields = parsed.components.schemas[name].required

                    field.relation = {
                        name,
                        fields: [],
                    }

                    field.relation.fields = Object.keys(refProperties).map((refProperty) => {
                        const refField: Partial<SwaggerField> = generateSwaggerField(refProperty, refProperties)
                        refField.isRequired = refRequiredFields ? refRequiredFields.includes(refProperty) : false
                        return refField as SwaggerField
                    })
                }
                return field as SwaggerField
            })

            return model
        })
        // console.log('schemas')
        // console.log(JSON.stringify(schemas))
        // console.log('paths')
        // console.log(JSON.stringify(paths))
        // console.log('models')
        // console.log(JSON.stringify(models, null, 2))

        return null
    } catch (error: any) {
        console.log('error', error)
        throw error
    }
}

export const getSchemas = (swagger: any) => {
    const schemas = Object.keys(swagger.components.schemas)
    return schemas
}

export const getRequestBodyFromPath = (schemas: any, path: string) => {
    const requestBody = schemas[path].post.requestBody
    return requestBody
}

export const getPaths = (swagger: any) => {
    const paths = Object.keys(swagger.paths)
    const allPaths = paths.map((path) => {
        const pathObject = swagger.paths[path]
        // const methods = Object.keys(pathObject)
        const methods = Object.keys(pathObject).map((method) => {
            const requestBody = pathObject[method].requestBody
            const parameters = pathObject[method].parameters

            return { method, requestBody, parameters }
        })

        return {
            path,
            methods,
        }
    })

    console.log('allPaths', JSON.stringify(allPaths, null, 2))

    return paths
}

export const getProperties = (swagger: any, schema: string) => {
    const properties = swagger.components.schemas[schema].properties
    return properties
}

const generateSwaggerField = (name: string, properties: any): Partial<SwaggerField> => {
    const field = {
        name,
        type: properties[name].type,
        isList: properties[name].type === 'array',
        isRelation: properties[name].type === 'object',
    }
    return field
}

const guessIsId = (name: string) => {
    return name === 'id'
}
