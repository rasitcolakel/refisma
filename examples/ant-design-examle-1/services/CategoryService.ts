import { Prisma } from "@prisma/client";
import * as CategorySchema from "@schemas/index";
import { getPrisma } from "./Service";

const model = getPrisma().category;
const select: Prisma.CategorySelect = {
  id: true,
  name: true,
  authorId: true,
  posts: true,
};
export const createCategory = async (
  data: CategorySchema.CategoryCreateType
) => {
  const category = await model.create({
    data: {
      ...data.body,
      posts: {
        connect: data.body.posts,
      },
    },
  });
  return category;
};

export const updateCategory = async (
  data: CategorySchema.CategoryUpdateType
) => {
  const category = await model.update({
    where: {
      id: data.query.id,
    },
    data: {
      ...data.body,
      posts: {
        connect: data.body.posts,
      },
    },
  });
  return category;
};

export const deleteCategory = async (
  data: CategorySchema.CategoryDeleteType
) => {
  const category = await model.delete({
    where: {
      id: data.query.id,
    },
  });
  return category;
};

export const getOneCategory = async (
  data: CategorySchema.CategoryFindOneType
) => {
  const category = await model.findUnique({
    where: {
      id: data.query.id,
    },
    select,
  });
  return category;
};

export const getManyCategory = async (
  data: CategorySchema.CategoryFindManyType
) => {
  const { query } = data;
  const args: Prisma.CategoryFindManyArgs = {};
  args.select = select;
  if (query.id) {
    args.where = {
      ...args.where,
      id: Array.isArray(query.id) ? { in: query.id } : { equals: query.id },
    };
  }

  if (query._end !== undefined && query._start !== undefined) {
    args.skip = query._start;
    args.take = query._end - query._start;
  }

  const category = await model.findMany(args);
  return category;
};
