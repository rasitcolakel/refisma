export type Model = {
    name: string
    fields: Field[]
}

export type Field = {
    name: string
    type: string
    multiple: boolean
    required: boolean
    relation?: RelationField | boolean
}

export type RelationField = Field & {
    fields: string[]
    references: string[]
    restrictions: Restrictions
}

export type Restrictions = {
    onUpdate: 'Cascade' | 'SetNull' | 'NoAction' | 'Restrict' | 'SetDefault' | null
    onDelete: 'Cascade' | 'SetNull' | 'NoAction' | 'Restrict' | 'SetDefault' | null
}
