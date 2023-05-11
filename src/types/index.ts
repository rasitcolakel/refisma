export type Endpoint = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    handler: (req: any, res: any) => any
    cache?: number
}

export type Repository = {
    name: string
    lowercasedName: string
    methods: {
        name: string
        params: string[]
        prismaMethodName?: string
        prismaMethodParams?: {
            name: string
            value?: any
        }[]
    }[]
}

export type Model = {
    name: string
    fields: Field[]
}

export type Field = {
    name: string
    type: string
    isList: boolean
    isRequired: boolean
    isUnique: boolean
    isId: boolean
    isUpdatedAt: boolean
    isCreatedAt: boolean
    isOptional: boolean
    isReadOnly: boolean
    isGenerated: boolean
}
