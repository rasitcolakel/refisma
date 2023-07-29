import { Prisma } from "@prisma/client";
import * as PostSchema from "@schemas/index";
import { getPrisma } from "./Service";

const model = getPrisma().post;
const select: Prisma.PostSelect = {
  id: true,
  title: true,
  content: true,
  published: true,
  authorId: true,
  categoryId: true,
  tags: true,
  likes: true,
};
export const createPost = async (data: PostSchema.PostCreateType) => {
  const post = await model.create({
    data: {
      ...data.body,
      tags: {
        connect: data.body.tags,
      },

      likes: {
        connect: data.body.likes,
      },
    },
  });
  return post;
};

export const updatePost = async (data: PostSchema.PostUpdateType) => {
  const post = await model.update({
    where: {
      id: data.query.id,
    },
    data: {
      ...data.body,
      tags: {
        connect: data.body.tags,
      },

      likes: {
        connect: data.body.likes,
      },
    },
  });
  return post;
};

export const deletePost = async (data: PostSchema.PostDeleteType) => {
  const post = await model.delete({
    where: {
      id: data.query.id,
    },
  });
  return post;
};

export const getOnePost = async (data: PostSchema.PostFindOneType) => {
  const post = await model.findUnique({
    where: {
      id: data.query.id,
    },
    select,
  });
  return post;
};

export const getManyPost = async (data: PostSchema.PostFindManyType) => {
  const { query } = data;
  const args: Prisma.PostFindManyArgs = {};
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

  const post = await model.findMany(args);
  return post;
};
