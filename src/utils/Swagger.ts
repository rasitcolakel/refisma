// generate a class from a swagger schema object

/**
 * @description
 *
 * */

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

export class Swagger {
    private paths: Path[] = []
    private swagger: any
    private schemas: any

    constructor(swagger: any) {
        this.swagger = swagger
        this.setPaths()
        this.setSchemas()
    }

    public getPaths = () => {
        return this.paths
    }

    public setPaths = () => {
        const paths = Object.keys(this.swagger.paths)
        this.paths = paths.map((path) => {
            const pathObject = this.swagger.paths[path]
            const methods = Object.keys(pathObject).map((method) => {
                const responsesObject = this.getResponsesOfPath(path, method)
                let responses = []
                if (responsesObject) {
                    responses = Object.keys(responsesObject).map((response) => {
                        const responseObject = responsesObject[response]
                        if (!responseObject.content) {
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

    public getSchemas = () => {
        return this.schemas
    }

    public setSchemas = () => {
        this.schemas = this.swagger.components.schemas
    }

    public getSchema = (schema: string) => {
        return this.swagger.components.schemas[schema]
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
}
