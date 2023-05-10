import { existsSync, mkdirSync, writeFile } from 'fs'
import { Endpoint } from '../types'
import { Model } from './readModels'

export const generateApiEndpointsInNextjsForModel = (model: Model) => {
    const service = generateServiceForModel(model)

    const apiEndpoints = `
    import { NextApiRequest, NextApiResponse } from 'next'
    import { create${model.name}, get${model.name}ById, get${model.name}s, update${model.name}, delete${
        model.name
    } } from '../../../services/${model.name.toLowerCase()}'

    const endpoints: Endpoint[] = [
        {
            method: 'GET',
            handler: async (req: NextApiRequest, res: NextApiResponse) => {
                const ${model.name.toLowerCase()}s = await get${model.name}s()
                
                res.status(200).json(${model.name.toLowerCase()}s)
            },
        },
        {
            method: 'POST',
            handler: async (req: NextApiRequest, res: NextApiResponse) => {
                const ${model.name.toLowerCase()} = await create${model.name}(req.body)

                res.status(200).json(${model.name.toLowerCase()})
            },
        },
        {
            method: 'GET',
            handler: async (req: NextApiRequest, res: NextApiResponse) => {
                const { id } = req.query

                const ${model.name.toLowerCase()} = await get${model.name}ById(id as string)

                res.status(200).json(${model.name.toLowerCase()})
            },
        },
        {
            method: 'PUT',
            handler: async (req: NextApiRequest, res: NextApiResponse) => {
                const { id } = req.query

                const ${model.name.toLowerCase()} = await update${model.name}(id as string, req.body)

                res.status(200).json(${model.name.toLowerCase()})
            },
        },
        {
            method: 'DELETE',
            handler: async (req: NextApiRequest, res: NextApiResponse) => {
                const { id } = req.query

                const ${model.name.toLowerCase()} = await delete${model.name}(id as string)

                res.status(200).json(${model.name.toLowerCase()})
            },
        },
    ]

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const endpoint = endpoints.find((endpoint) => endpoint.method === req.method)

        if (!endpoint) {
            res.status(404).json({
                message: 'Not found',
            })
        }else{
            endpoint.handler(req, res)
        }

    `

    checkFolderExists('./pages')
    checkFolderExists('./pages/api')
    checkFolderExists('./services')

    writeFile(`./pages/api/${model.name.toLowerCase()}.ts`, apiEndpoints, (err) => {
        if (err) {
            console.error(err)
        }
    })

    writeFile(`./services/${model.name.toLowerCase()}.ts`, service, (err) => {
        if (err) {
            console.error(err)
        }
    })
}

export const generateServiceForModel = (model: Model) => {
    const service = `
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const create${model.name} = async (data: Prisma.${model.name}CreateInput) => {
    const ${model.name.toLowerCase()} = await prisma.${model.name}.create({
        data,
    })

    return ${model.name.toLowerCase()}
}

export const get${model.name}ById = async (id: string) => {
    const ${model.name.toLowerCase()} = await prisma.${model.name}.findUnique({
        where: {
            id,
        },
    })

    return ${model.name.toLowerCase()}
}

export const get${model.name}s = async () => {
    const ${model.name.toLowerCase()}s = await prisma.${model.name}.findMany()

    return ${model.name.toLowerCase()}s
}

export const update${model.name} = async (id: string, data: Prisma.${model.name}UpdateInput) => {
    const ${model.name.toLowerCase()} = await prisma.${model.name}.update({
        where: {
            id,
        },
        data,
    })

    return ${model.name.toLowerCase()}
}

export const delete${model.name} = async (id: string) => {
    const ${model.name.toLowerCase()} = await prisma.${model.name}.delete({
        where: {
            id,
        },
    })

    return ${model.name.toLowerCase()}
}
    `
    return service
}

const checkFolderExists = (path: string) => {
    if (!existsSync(path)) {
        mkdirSync(path)
    }
}
