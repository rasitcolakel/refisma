import { Prisma, PrismaClient } from '@prisma/client'
import prisma from './PrismaService'

const model = prisma.post

const post = Prisma.validator<Prisma.PostArgs>()({
    select: {
        id: true,
        title: true,
        content: true,
        published: true,
        author: {
            select: {
                id: true,
                email: true,
                name: true,
            },
        },
        authorId: true,
        category: {
            select: {
                id: true,
                name: true,
                authorId: true,
            },
        },
        categoryId: true,
        tags: true,
        _count: {
            select: {
                tags: true,
            },
        },
    },
})

export type PostSelect = Prisma.PostGetPayload<typeof post>
const select = post.select

export const createPost = async (body: Prisma.PostCreateInput) => {
    const result = await model.create({
        data: body,
        select,
    })

    return result
}
export const getByIdPost = async (id: number) => {
    const result = await model.findUnique({
        where: {
            id,
        },
        select,
    })

    return result
}
export const findManyPost = async () => {
    const result = await model.findMany({ select })

    return result
}
export const updatePost = async (id: number, body: Prisma.PostUpdateInput) => {
    const result = await model.update({
        where: {
            id,
        },
        data: body,
        select,
    })

    return result
}
export const deletePost = async (id: number) => {
    const result = await model.delete({
        where: {
            id,
        },
        select,
    })

    return result
}
