import { Prisma, PrismaClient } from '@prisma/client'
import prisma from './PrismaService'

const model = prisma.user

const userSelect = {
    id: true,
    email: true,
    name: true,
    posts: {
        select: {
            id: true,
            title: true,
            content: true,
            published: true,
            authorId: true,
            categoryId: true,
        },
    },
    categories: {
        select: {
            id: true,
            name: true,
            authorId: true,
        },
    },
    tags: {
        select: {
            id: true,
            name: true,
            authorId: true,
        },
    },
    likes: {
        select: {
            id: true,
            postId: true,
            authorId: true,
        },
    },
    _count: {
        select: {
            posts: true,
            categories: true,
            tags: true,
            likes: true,
        },
    },
}

const user = Prisma.validator<Prisma.UserArgs>()({
    select: userSelect,
})

export type UserSelect = Prisma.UserGetPayload<typeof user>
const select = user.select

export const createUser = async (body: Prisma.UserCreateInput) => {
    const _select = { ...select } as Prisma.UserSelect
    _select.id = select?.id ?? true
    _select.email = select?.email ?? true
    _select.name = select?.name ?? true
    _select.posts = false
    _select.categories = false
    _select.tags = false
    _select.likes = false
    const result = await model.create({
        data: body,
        select: _select,
    })

    return result
}
export const getByIdUser = async (id: number) => {
    const _select = { ...select } as Prisma.UserSelect
    _select.id = select?.id ?? true
    _select.email = select?.email ?? true
    _select.name = select?.name ?? true
    _select.posts = select?.posts ?? true
    _select.categories = false
    _select.tags = false
    _select.likes = false
    const result = await model.findUnique({
        where: {
            id,
        },
        select: _select,
    })

    return result
}
export const findManyUser = async () => {
    const _select = { ...select } as Prisma.UserSelect
    _select.id = select?.id ?? true
    _select.email = select?.email ?? true
    _select.name = select?.name ?? true
    _select.posts = select?.posts ?? true
    _select.categories = false
    _select.tags = false
    _select.likes = false
    const result = await model.findMany({ select: _select })

    return result
}
export const updateUser = async (id: number, body: Prisma.UserUpdateInput) => {
    const _select = { ...select } as Prisma.UserSelect
    _select.id = select?.id ?? true
    _select.email = select?.email ?? true
    _select.name = select?.name ?? true
    _select.posts = false
    _select.categories = false
    _select.tags = false
    _select.likes = false
    const result = await model.update({
        where: {
            id,
        },
        data: body,
        select: _select,
    })

    return result
}
export const deleteUser = async (id: number) => {
    const _select = { ...select } as Prisma.UserSelect
    _select.id = false
    _select.email = false
    _select.name = false
    _select.posts = false
    _select.categories = false
    _select.tags = false
    _select.likes = false
    const result = await model.delete({
        where: {
            id,
        },
        select: _select,
    })

    return result
}
