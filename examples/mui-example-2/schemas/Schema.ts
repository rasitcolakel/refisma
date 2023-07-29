import { z } from "zod";

const PaginationSchema = z.object({
  _end: z.preprocess(Number, z.number()).optional(),
  _start: z.preprocess(Number, z.number()).optional(),
});

type paginationType = z.infer<typeof PaginationSchema>;

export { type paginationType, PaginationSchema };