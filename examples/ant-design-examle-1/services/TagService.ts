import { Prisma } from "@prisma/client";
import * as TagSchema from "@schemas/index";
import { getPrisma } from "./Service";

const model = getPrisma().tag;
const select: Prisma.TagSelect = {
  id: true,
  name: true,
  posts: true,
  authorId: true,
};
export const createTag = async (data: TagSchema.TagCreateType) => {
  const tag = await model.create({
    data: {
      ...data.body,
      posts: {
        connect: data.body.posts,
      },
    },
  });
  return tag;
};

export const updateTag = async (data: TagSchema.TagUpdateType) => {
  const tag = await model.update({
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
  return tag;
};

export const deleteTag = async (data: TagSchema.TagDeleteType) => {
  const tag = await model.delete({
    where: {
      id: data.query.id,
    },
  });
  return tag;
};

export const getOneTag = async (data: TagSchema.TagFindOneType) => {
  const tag = await model.findUnique({
    where: {
      id: data.query.id,
    },
    select,
  });
  return tag;
};

export const getManyTag = async (data: TagSchema.TagFindManyType) => {
  const { query } = data;
  const args: Prisma.TagFindManyArgs = {};
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

  const tag = await model.findMany(args);
  return tag;
};
