import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const model = prisma.user;

const user = Prisma.validator<Prisma.UserArgs>()({
  select: {
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
    _count: {
      select: {
        posts: true,
        categories: true,
        tags: true,
      },
    },
  },
});

export type UserSelect = Prisma.UserGetPayload<typeof user>;
const select = user.select;

export const createUser = async (body: Prisma.UserCreateInput) => {
  const result = await model.create({
    data: body,
    select,
  });

  return result;
};
export const getByIdUser = async (id: number) => {
  const result = await model.findUnique({
    where: {
      id,
    },
    select,
  });

  return result;
};
export const findManyUser = async () => {
  const result = await model.findMany({ select });

  return result;
};
export const updateUser = async (id: number, body: Prisma.UserUpdateInput) => {
  const result = await model.update({
    where: {
      id,
    },
    data: body,
    select,
  });

  return result;
};
export const deleteUser = async (id: number) => {
  const result = await model.delete({
    where: {
      id,
    },
    select,
  });

  return result;
};
