import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const model = prisma.tag;

const tag = Prisma.validator<Prisma.TagArgs>()({
  select: {
    id: true,
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
});

export type TagSelect = Prisma.TagGetPayload<typeof tag>;
const select = tag.select;

export const createTag = async (body: Prisma.TagCreateInput) => {
  const result = await model.create({
    data: body,
    select,
  });

  return result;
};
export const getByIdTag = async (id: number) => {
  const result = await model.findUnique({
    where: {
      id,
    },
    select,
  });

  return result;
};
export const findManyTag = async () => {
  const result = await model.findMany({ select });

  return result;
};
export const updateTag = async (id: number, body: Prisma.TagUpdateInput) => {
  const result = await model.update({
    where: {
      id,
    },
    data: body,
    select,
  });

  return result;
};
export const deleteTag = async (id: number) => {
  const result = await model.delete({
    where: {
      id,
    },
    select,
  });

  return result;
};
