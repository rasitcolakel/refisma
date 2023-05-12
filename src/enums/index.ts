export enum MethodNames {
    create = 'create',
    findMany = 'findMany',
    getById = 'getById',
    update = 'update',
    delete = 'delete',
}
export type TMethodNames = keyof typeof MethodNames

export enum PrismaScalarTypes {
    String = 'String',
    Boolean = 'Boolean',
    Int = 'Int',
    BigInt = 'BigInt',
    Float = 'Float',
    Decimal = 'Decimal',
    DateTime = 'DateTime',
    Json = 'Json',
    Bytes = 'Bytes',
    Unsupported = 'Unsupported',
}

export type TPrismaScalarTypes = keyof typeof PrismaScalarTypes

export enum PrismaRelationTypes {
    OneToOne = 'OneToOne',
    OneToMany = 'OneToMany',
    ManyToMany = 'ManyToMany',
}

export enum PrismaAttributes {
    Id = '@id',
    IId = '@@id',
    Default = '@default',
    Unique = '@unique',
    UUnique = '@@unique',
    IIndex = '@@index',
    Relation = '@relation',
    Map = '@map',
    MMap = '@@map',
    UpdatedAt = '@updatedAt',
    Ignore = '@ignore',
    IIgnore = '@@ignore',
    Schema = '@schema',
}
