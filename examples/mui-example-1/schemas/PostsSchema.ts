import { z } from "zod";

const body = z.object({
  title: z.string(),
  content: z.string().optional(),
  published: z.preprocess(Boolean, z.boolean()),
  userId: z.preprocess(Number, z.number()).optional(),
  categoryId: z.preprocess(Number, z.number()),
});

const query = z.object({
  id: z.preprocess(Number, z.number()),
});

export const createPostSchema = z.object({
  body,
});
export type createPostType = z.infer<typeof createPostSchema>;

export const getByIdPostSchema = z.object({
  query,
});
export type getByIdPostType = z.infer<typeof getByIdPostSchema>;

export const findManyPostSchema = z.object({});
export type findManyPostType = z.infer<typeof findManyPostSchema>;

export const updatePostSchema = z.object({
  query,
  body,
});
export type updatePostType = z.infer<typeof updatePostSchema>;

export const deletePostSchema = z.object({
  query,
});
export type deletePostType = z.infer<typeof deletePostSchema>;
