import { Prisma } from "@prisma/client";
import * as UserSchema from "@schemas/index";
import { getPrisma } from "./Service";

const model = getPrisma().user;
const select: Prisma.UserSelect = {
  id: true,
  email: true,
  name: true,
  posts: true,
  categories: true,
  tags: true,
  likes: true,
};
export const createUser = async (data: UserSchema.UserCreateType) => {
  const user = await model.create({
    data: {
      ...data.body,
      posts: {
        connect: data.body.posts,
      },

      categories: {
        connect: data.body.categories,
      },

      tags: {
        connect: data.body.tags,
      },

      likes: {
        connect: data.body.likes,
      },
    },
  });
  return user;
};

export const updateUser = async (data: UserSchema.UserUpdateType) => {
  const user = await model.update({
    where: {
      id: data.query.id,
    },
    data: {
      ...data.body,
      posts: {
        connect: data.body.posts,
      },

      categories: {
        connect: data.body.categories,
      },

      tags: {
        connect: data.body.tags,
      },

      likes: {
        connect: data.body.likes,
      },
    },
  });
  return user;
};

export const deleteUser = async (data: UserSchema.UserDeleteType) => {
  const user = await model.delete({
    where: {
      id: data.query.id,
    },
  });
  return user;
};

export const getOneUser = async (data: UserSchema.UserFindOneType) => {
  const user = await model.findUnique({
    where: {
      id: data.query.id,
    },
    select,
  });
  return user;
};

export const getManyUser = async (data: UserSchema.UserFindManyType) => {
  const { query } = data;
  const args: Prisma.UserFindManyArgs = {};
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

  const user = await model.findMany(args);
  return user;
};
