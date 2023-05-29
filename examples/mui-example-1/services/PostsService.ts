import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const model = prisma.post;

const post = Prisma.validator<Prisma.PostArgs>()({
  select: {
    id: true,
    title: true,
    content: true,
    published: true,
    user: {
      select: {
        id: true,
        email: true,
        name: true,
      },
    },
    userId: true,
    category: {
      select: {
        id: true,
        name: true,
        userId: true,
      },
    },
    categoryId: true,
  },
});

export type PostSelect = Prisma.PostGetPayload<typeof post>;
const select = post.select;

export const createPost = async (body: Prisma.PostCreateInput) => {
  const result = await model.create({
    data: body,
    select,
  });

  return result;
};
export const getByIdPost = async (id: number) => {
  const result = await model.findUnique({
    where: {
      id,
    },
    select,
  });

  return result;
};
export const findManyPost = async () => {
  const result = await model.findMany({ select });

  return result;
};
export const updatePost = async (id: number, body: Prisma.PostUpdateInput) => {
  const result = await model.update({
    where: {
      id,
    },
    data: body,
    select,
  });

  return result;
};
export const deletePost = async (id: number) => {
  const result = await model.delete({
    where: {
      id,
    },
    select,
  });

  return result;
};
