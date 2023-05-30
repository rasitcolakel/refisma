import { z } from "zod";

const body = z.object({
  email: z.string(),
  name: z.string().optional(),
});

const query = z.object({
  id: z.preprocess(Number, z.number()),
});

export const createUserSchema = z.object({
  body,
});
export type createUserType = z.infer<typeof createUserSchema>;

export const getByIdUserSchema = z.object({
  query,
});
export type getByIdUserType = z.infer<typeof getByIdUserSchema>;

export const findManyUserSchema = z.object({});
export type findManyUserType = z.infer<typeof findManyUserSchema>;

export const updateUserSchema = z.object({
  query,
  body,
});
export type updateUserType = z.infer<typeof updateUserSchema>;

export const deleteUserSchema = z.object({
  query,
});
export type deleteUserType = z.infer<typeof deleteUserSchema>;
