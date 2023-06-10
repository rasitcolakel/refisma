// read swagger with yamljs

import { promises } from 'fs'
import { parse } from 'yamljs'
import { Model, Field } from '../../types'
import { Swagger } from './Swagger'

type SwaggerModel = {
    name: string
    fields: SwaggerField[]
}

type SwaggerField = Pick<Field, 'name' | 'type' | 'isList' | 'isRelation' | 'isRequired'> & {
    relation: SwaggerModel
}

export const readSwagger = async (file: string) => {
    try {
        const fileExtension = file.split('.').pop()

        await promises.access(file)
        const schema = await promises.readFile(file, 'utf-8')
        const parsed = fileExtension === 'json' ? JSON.parse(schema) : parse(schema)
        const swagger = new Swagger(parsed)
        Object.keys(swagger.getSchemas()).forEach((key) => {
            console.log(key, swagger.schemaToInterField(swagger.getSchemas()[key]))
        })
    } catch (error: any) {
        console.log('error', error)
        throw error
    }
}
