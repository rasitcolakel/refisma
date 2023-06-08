// read swagger with yamljs

import { promises } from 'fs'
import { parse } from 'yamljs'
import { Model, Field } from '../types'
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
        await promises.access(file)
        const schema = await promises.readFile(file, 'utf-8')
        const parsed = parse(schema)
        const swagger = new Swagger(parsed)
        const paths = swagger.getPaths()
        const schemas = swagger.getSchemas()
        console.log('paths', JSON.stringify({ paths, schemas }))

        // console.log('allPaths', JSON.stringify(allPaths))
    } catch (error: any) {
        console.log('error', error)
        throw error
    }
}
