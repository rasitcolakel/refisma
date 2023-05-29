import { TMethodNames, TPrismaScalarTypes } from '../enums'

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
    pluralizedName: string
    pluralizedNameLowercased: string
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
    getCounts?: boolean
    fields?: Field[]
}

export type Model = {
    name: string
    fields: Field[]
}

export type FormField = Field & {
    elementType: Element
}

export enum Element {
    text = 'text',
    number = 'number',
    date = 'date',
    select = 'select',
    checkbox = 'checkbox',
    radio = 'radio',
    switch = 'switch',
    slider = 'slider',
    autocomplete = 'autocomplete',
}

export type Field = {
    name: string
    staticRelationName?: string
    showName?: string
    type: TPrismaScalarTypes
    isList: boolean
    isRelation: boolean
    relation: PrismaRelationArgs
    relatedModel?: Model
    isRequired: boolean
    isUnique: boolean
    isId: boolean
    isUpdatedAt: boolean
    isCreatedAt: boolean
    isOptional: boolean
    isReadOnly: boolean
    isGenerated: boolean
    isMainRelation?: boolean
}

export type ZodModel = {
    name: string
    type: string
    required: boolean
    optional: boolean
    id: boolean
}

export type PrismaRelationArgs = {
    fields?: string[]
    references?: string
    name?: string
    onDelete?: string
    onUpdate?: string
    map?: string
    // custom properties
    type?: string
}
export type KeyOf<T> = keyof T
