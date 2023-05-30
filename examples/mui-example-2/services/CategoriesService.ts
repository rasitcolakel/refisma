import { Prisma, PrismaClient } from '@prisma/client'
import prisma from './PrismaService'
const model = prisma.category

const category = Prisma.validator<Prisma.CategoryArgs>()({
    select: {
        id: true,
        name: true,
        authorId: true,
        author: {
            select: {
                id: true,
                email: true,
                name: true,
            },
        },
        _count: {
            select: {
                posts: true,
            },
        },
    },
})

export type CategorySelect = Prisma.CategoryGetPayload<typeof category>
const select = category.select

export const createCategory = async (body: Prisma.CategoryCreateInput) => {
    const result = await model.create({
        data: body,
        select,
    })

    return result
}
export const getByIdCategory = async (id: number) => {
    const result = await model.findUnique({
        where: {
            id,
        },
        select,
    })

    return result
}
export const findManyCategory = async () => {
    const result = await model.findMany({ select })

    return result
}
export const updateCategory = async (id: number, body: Prisma.CategoryUpdateInput) => {
    const result = await model.update({
        where: {
            id,
        },
        data: body,
        select,
    })

    return result
}
export const deleteCategory = async (id: number) => {
    const result = await model.delete({
        where: {
            id,
        },
        select,
    })

    return result
}
