import { Model } from './types'

export const makeEndpoints = (model: Model) => {
    type Endpoint = {
        plural: boolean
        method: string[] | string
        schemaName: string
        functionName: string
    }
    const endpoints: Endpoint[] = [
        // PLURAL ENDPOINTS
        {
            plural: true,
            method: 'POST',
            schemaName: `${model.name}Create`,
            functionName: `${model.name}Service.create${model.name}`,
        },
        {
            plural: true,
            method: 'GET',
            schemaName: `${model.name}FindMany`,
            functionName: `${model.name}Service.getMany${model.name}`,
        },
        // SINGULAR ENDPOINTS
        {
            plural: false,
            method: 'GET',
            schemaName: `${model.name}FindOne`,
            functionName: `${model.name}Service.getOne${model.name}`,
        },
        {
            plural: false,
            method: ['PUT', 'PATCH'],
            schemaName: `${model.name}Update`,
            functionName: `${model.name}Service.update${model.name}`,
        },
        {
            plural: false,
            method: 'DELETE',
            schemaName: `${model.name}Delete`,
            functionName: `${model.name}Service.delete${model.name}`,
        },
    ]

    return {
        pluralEndpoints: endpoints.filter((endpoint) => endpoint.plural),
        singularEndpoints: endpoints.filter((endpoint) => !endpoint.plural),
    }
}
