import { z } from "zod";

const body = z.object({
  name: z.string().optional(),
});

const query = z.object({
  id: z.preprocess(Number, z.number()),
});

export const createCategorySchema = z.object({
  body,
});
export type createCategoryType = z.infer<typeof createCategorySchema>;

export const getByIdCategorySchema = z.object({
  query,
});
export type getByIdCategoryType = z.infer<typeof getByIdCategorySchema>;

export const findManyCategorySchema = z.object({});
export type findManyCategoryType = z.infer<typeof findManyCategorySchema>;

export const updateCategorySchema = z.object({
  query,
  body,
});
export type updateCategoryType = z.infer<typeof updateCategorySchema>;

export const deleteCategorySchema = z.object({
  query,
});
export type deleteCategoryType = z.infer<typeof deleteCategorySchema>;
