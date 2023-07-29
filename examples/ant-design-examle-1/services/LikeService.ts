import { Prisma } from "@prisma/client";
import * as LikeSchema from "@schemas/index";
import { getPrisma } from "./Service";

const model = getPrisma().like;
const select: Prisma.LikeSelect = { id: true, postId: true, authorId: true };
export const createLike = async (data: LikeSchema.LikeCreateType) => {
  const like = await model.create({
    data: {
      ...data.body,
    },
  });
  return like;
};

export const updateLike = async (data: LikeSchema.LikeUpdateType) => {
  const like = await model.update({
    where: {
      id: data.query.id,
    },
    data: {
      ...data.body,
    },
  });
  return like;
};

export const deleteLike = async (data: LikeSchema.LikeDeleteType) => {
  const like = await model.delete({
    where: {
      id: data.query.id,
    },
  });
  return like;
};

export const getOneLike = async (data: LikeSchema.LikeFindOneType) => {
  const like = await model.findUnique({
    where: {
      id: data.query.id,
    },
    select,
  });
  return like;
};

export const getManyLike = async (data: LikeSchema.LikeFindManyType) => {
  const { query } = data;
  const args: Prisma.LikeFindManyArgs = {};
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

  const like = await model.findMany(args);
  return like;
};
