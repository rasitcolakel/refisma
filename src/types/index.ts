import { type } from 'os'
import { PrismaScalarTypes, TMethodNames, TPrismaScalarTypes } from '../enums'

export type Endpoint = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    handler: (req: any, res: any) => any
    cache?: number
}

type Param = {
    name: string
    type: string
    from?: string
}

export type Repository = {
    name: string
    lowercasedName: string
    methods: {
        isSingular: boolean
        name: TMethodNames
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
        customName?: string
        params: Param[]
        requestParams: {
            name: string
            as?: string
            type?: string
            values?: Param[]
        }[]
    }[]
    zodSchema?: ZodModel[]
}

export type Model = {
    name: string
    fields: Field[]
}

export type Field = {
    name: string
    type: TPrismaScalarTypes
    isList: boolean
    isRelation: boolean
    isRequired: boolean
    isUnique: boolean
    isId: boolean
    isUpdatedAt: boolean
    isCreatedAt: boolean
    isOptional: boolean
    isReadOnly: boolean
    isGenerated: boolean
}

export type ZodModel = {
    name: string
    type: string
    required: boolean
    optional: boolean
    id: boolean
}
