import { Prisma } from './Prisma'
import { Model } from './types'

const prisma = new Prisma()
const generateData = (model: Model) => {
    let data = `...data.body,`
    model.fields.forEach((field) => {
        if (field.multiple && field.relation === true) {
            data += `
                ${field.name}: {
                    connect: data.body.${field.name},
                },
            `
        }
    })
    return data
}

const generateArgs = (model: Model) => {
    const query = `
        const { query } = data
        const args: Prisma.${model.name}FindManyArgs = {}
        args.select = select;
        if (query.id) {
            args.where = {
                ...args.where,
                id : Array.isArray(query.id) ? { in: query.id } : { equals: query.id }
            }
        }

        if (query._end !== undefined && query._start !== undefined) {
            args.skip = query._start
            args.take = query._end - query._start
        }
    `
    return query
}

const generateCreateFunction = (model: Model) => {
    return `
        export const create${model.name} = async (data: ${model.name}Schema.${model.name}CreateType) => {
            const ${model.name.toLowerCase()} = await model.create({
                data: {
                    ${generateData(model)}
                },
            });
            return ${model.name.toLowerCase()};
        };
    `
}

const generateUpdateFunction = (model: Model) => {
    return `
        export const update${model.name} = async (data: ${model.name}Schema.${model.name}UpdateType) => {
            const ${model.name.toLowerCase()} = await model.update({
                where: {
                    id: data.query.id,
                },
                data: {
                    ${generateData(model)}
                },
            });
            return ${model.name.toLowerCase()};
        };
    `
}

const generateDeleteFunction = (model: Model) => {
    return `
        export const delete${model.name} = async (data: ${model.name}Schema.${model.name}DeleteType) => {
            const ${model.name.toLowerCase()} = await model.delete({
                where: {
                    id: data.query.id,
                },
            });
            return ${model.name.toLowerCase()};
        };
    `
}

const generateFindOneFunction = (model: Model) => {
    return `
        export const getOne${model.name} = async (data: ${model.name}Schema.${model.name}FindOneType) => {
            const ${model.name.toLowerCase()} = await model.findUnique({
                where: {
                    id: data.query.id,
                },
                select,
            });
            return ${model.name.toLowerCase()};
        };
    `
}

const generateFindManyFunction = (model: Model) => {
    return `
        export const getMany${model.name} = async (data: ${model.name}Schema.${model.name}FindManyType) => {
            ${generateArgs(model)}
            const ${model.name.toLowerCase()} = await model.findMany(args);
            return ${model.name.toLowerCase()};
        };

    `
}

const generateSelect = (models: Model[], modelName: string) => {
    const model = models.find((model) => model.name === modelName)
    if (!model) {
        return ''
    }
    let select = `const select: Prisma.${model.name}Select = {`
    model.fields.forEach((field) => {
        if (!prisma.checkScalarType(field.type) && typeof field.relation === 'object') {
            // do nothing
        } else {
            select += `${field.name}: true,`
        }
    })
    select += `}`
    return select
}
export {
    generateCreateFunction,
    generateUpdateFunction,
    generateDeleteFunction,
    generateFindOneFunction,
    generateFindManyFunction,
    generateSelect,
}
