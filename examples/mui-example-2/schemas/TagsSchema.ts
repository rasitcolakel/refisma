import { z } from "zod";

const body = z.object({
  name: z.string(),
  authorId: z.preprocess(Number, z.number()).optional(),
});

const query = z.object({
  id: z.preprocess(Number, z.number()),
});

export const createTagSchema = z.object({
  body,
});
export type createTagType = z.infer<typeof createTagSchema>;

export const getByIdTagSchema = z.object({
  query,
});
export type getByIdTagType = z.infer<typeof getByIdTagSchema>;

export const findManyTagSchema = z.object({});
export type findManyTagType = z.infer<typeof findManyTagSchema>;

export const updateTagSchema = z.object({
  query,
  body,
});
export type updateTagType = z.infer<typeof updateTagSchema>;

export const deleteTagSchema = z.object({
  query,
});
export type deleteTagType = z.infer<typeof deleteTagSchema>;
