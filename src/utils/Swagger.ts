/**
 * @description
 * Swagger class
 * */

import { makePlural } from '.'
import { InferField, InferType } from '../types'

type Resource = {
    name: string
    paths: Path[]
}

type Path = {
    path: string
    methods: Method[]
}

type Method = {
    method: string
    requestBody: any
    parameters: any
    responses: any
}

type Schemas = {
    [key: string]: Schema
}

type Schema = {
    type: string
    properties: Properties
    required?: string[]
}

type Properties = {
    [key: string]: {
        type: InferType
        format?: string
        items?: {
            $ref: string
        }
    } & {
        $ref?: string
    }
}

export class Swagger {
    private paths: Path[] = []
    private swagger: any
    private schemas: Schemas = {}
    private resources: Resource[] = []
    private schemaVersion: string

    constructor(swagger: any) {
        this.swagger = swagger
        this.setPaths()
        this.setSchemas()
        this.setResources()
        this.schemaVersion = this.swagger.openapi || this.swagger.swagger
    }

    public getPaths = () => {
        return this.paths
    }

    private setPaths = () => {
        const paths = Object.keys(this.swagger.paths)
        this.paths = paths.map((path) => {
            const pathObject = this.swagger.paths[path]
            const methods = Object.keys(pathObject).map((method) => {
                const responsesObject = this.getResponsesOfPath(path, method)
                let responses = []
                if (responsesObject) {
                    responses = Object.keys(responsesObject).map((response) => {
                        const responseObject = responsesObject[response]
                        if (responseObject.content) {
                            return {
                                response,
                                ...responseObject,
                            }
                        }
                        return {
                            response,
                        }
                    })
                }
                const requestBody = this.getRequestBodyOfPath(path, method)
                const parameters = pathObject[method].parameters
                return { method, requestBody, parameters, responses }
            })

            return {
                path,
                methods,
            }
        })
    }

    private mergePaths = () => {
        const paths = this.getPaths().sort((a, b) => a.path.localeCompare(b.path))
        const resources: Resource[] = []

        for (const path of paths) {
            const resource = resources.find((resource) => resource.name === this.clearPathName(path.path))

            if (resource) {
                resource.paths.push({
                    ...path,
                    path: path.path.replace(resource.name, ''),
                })
            } else {
                resources.push({
                    name: this.clearPathName(path.path),
                    paths: [
                        {
                            ...path,
                            path: path.path.replace(path.path, ''),
                        },
                    ],
                })
            }
        }

        return resources
    }

    public getResources = () => {
        return this.resources
    }

    private setResources = () => {
        this.resources = this.mergePaths()
    }

    public clearPathName = (path: string) => {
        const isParam = path.includes('{')

        if (isParam) {
            const split = path.split('/')
            const clearPath = split.slice(0, split.length - 1).join('/')
            return clearPath
        }

        return path
    }

    public getSchemaByName = (name: string) => {
        return this.schemas[name]
    }

    public getSchemas = () => {
        return this.schemas
    }

    private setSchemas = () => {
        this.schemas = this.swagger.components.schemas as Schemas
    }

    public getSchemaProperties = (schema: string) => {
        return this.swagger.components.schemas[schema].properties
    }

    public getRequestBodyOfPath = (path: string, method: string = 'post') => {
        return this.swagger.paths[path][method].requestBody
    }

    public getSchemaFromObject = (object: any) => {
        const schema = object.content['application/json'].schema
        const isRef = schema.$ref || schema.items?.$ref
        if (isRef) {
            const ref = isRef.split('/')
            const schemaName = ref[ref.length - 1]
            return this.swagger.components.schemas[schemaName]
        }

        return schema
    }

    public getResponsesOfPath = (path: string, method: string = 'post') => {
        return this.swagger.paths[path][method].responses
    }

    public schemaToInterField = (schema: Schema): InferField[] => {
        const properties = schema.properties

        const fields: InferField[] = Object.keys(properties).map((key) => {
            const property = properties[key]
            const relation = !!property.items?.$ref
            const multiple = property.type === 'array'
            let field: InferField = {
                key,
                type: relation
                    ? multiple
                        ? 'array'
                        : 'object'
                    : this.propertyTypeToInterType(property.type as string),
                relation,
                multiple,
            }

            if (property.$ref) {
                const ref = property.$ref.split('/')

                if (ref) {
                    const schemaName = ref[ref.length - 1]
                    const schema = this.getSchemaByName(schemaName)
                    // console.log('schema', schema)
                    if (schema) {
                        field = {
                            ...field,
                            relation: true,
                            type: 'relation',
                        }
                    }
                }
            }
            if (relation) {
                const ref = property?.items?.$ref.split('/')
                if (ref) {
                    const schemaName = makePlural(ref[ref.length - 1])
                    field = {
                        ...field,
                        relation: true,
                        type: 'relation',
                        multiple: true,
                        resource: {
                            name: schemaName,
                            route: schemaName.toLowerCase(),
                        },
                    }
                }
            }

            return field
        })

        return fields
    }

    public propertyTypeToInterType = (type: string, format: string = '') => {
        switch (type) {
            case 'string':
                switch (format) {
                    case 'date-time':
                        return 'date'
                    case 'email':
                        return 'email'
                    case 'uri':
                        return 'url'
                    case 'binary':
                        return 'image'
                    case 'richtext':
                        return 'richtext'
                    default:
                        return 'text'
                }
            case 'integer':
            case 'number':
                return 'number'
            case 'boolean':
                return 'boolean'
            default:
                return 'unknown'
        }
    }
}
