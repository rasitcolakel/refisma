import * as z from "zod";
import { PaginationSchema } from "./Schema";

// IMPORTANT: These schemas may be used in other schemas, so they must defined first

export const LikeIdSchema = z.object({
  id: z.preprocess(Number, z.number()),
});
export const LikeSingleQuerySchema = z.object({
  query: LikeIdSchema,
});

export const CategoryIdSchema = z.object({
  id: z.preprocess(Number, z.number()),
});
export const CategorySingleQuerySchema = z.object({
  query: CategoryIdSchema,
});

export const TagIdSchema = z.object({
  id: z.preprocess(Number, z.number()),
});
export const TagSingleQuerySchema = z.object({
  query: TagIdSchema,
});

export const PostIdSchema = z.object({
  id: z.preprocess(Number, z.number()),
});
export const PostSingleQuerySchema = z.object({
  query: PostIdSchema,
});

export const UserIdSchema = z.object({
  id: z.preprocess(Number, z.number()),
});
export const UserSingleQuerySchema = z.object({
  query: UserIdSchema,
});
export const LikeSchema = z.object({
  id: z
    .preprocess(
      (value) => (Array.isArray(value) ? value.map(Number) : Number(value)),
      z.union([z.number(), z.array(z.number())])
    )
    .optional(),
  postId: z.preprocess(Number, z.number()),
  authorId: z.preprocess(Number, z.number()).optional(),
});
export type LikeType = z.infer<typeof LikeSchema>;
export const LikeBody = LikeSchema.omit({
  id: true,
});
export const LikeQuery = LikeSchema.pick({
  id: true,
}).merge(PaginationSchema);
export const LikeQuerySchema = z.object({
  query: LikeQuery,
});
export const LikeBodySchema = z.object({
  body: LikeBody,
});
export const LikeCreate = LikeBodySchema;
export type LikeCreateType = z.infer<typeof LikeCreate>;
export const LikeUpdate = LikeBodySchema.merge(LikeSingleQuerySchema);
export type LikeUpdateType = z.infer<typeof LikeUpdate>;
export const LikeDelete = LikeSingleQuerySchema;
export type LikeDeleteType = z.infer<typeof LikeDelete>;
export const LikeFindOne = LikeSingleQuerySchema;
export type LikeFindOneType = z.infer<typeof LikeFindOne>;
export const LikeFindMany = LikeQuerySchema;
export type LikeFindManyType = z.infer<typeof LikeFindMany>;
export const CategorySchema = z.object({
  id: z
    .preprocess(
      (value) => (Array.isArray(value) ? value.map(Number) : Number(value)),
      z.union([z.number(), z.array(z.number())])
    )
    .optional(),
  name: z.string().optional(),
  authorId: z.preprocess(Number, z.number()).optional(),
  posts: z.array(PostIdSchema).optional(),
});
export type CategoryType = z.infer<typeof CategorySchema>;
export const CategoryBody = CategorySchema.omit({
  id: true,
});
export const CategoryQuery = CategorySchema.pick({
  id: true,
}).merge(PaginationSchema);
export const CategoryQuerySchema = z.object({
  query: CategoryQuery,
});
export const CategoryBodySchema = z.object({
  body: CategoryBody,
});
export const CategoryCreate = CategoryBodySchema;
export type CategoryCreateType = z.infer<typeof CategoryCreate>;
export const CategoryUpdate = CategoryBodySchema.merge(
  CategorySingleQuerySchema
);
export type CategoryUpdateType = z.infer<typeof CategoryUpdate>;
export const CategoryDelete = CategorySingleQuerySchema;
export type CategoryDeleteType = z.infer<typeof CategoryDelete>;
export const CategoryFindOne = CategorySingleQuerySchema;
export type CategoryFindOneType = z.infer<typeof CategoryFindOne>;
export const CategoryFindMany = CategoryQuerySchema;
export type CategoryFindManyType = z.infer<typeof CategoryFindMany>;
export const TagSchema = z.object({
  id: z
    .preprocess(
      (value) => (Array.isArray(value) ? value.map(Number) : Number(value)),
      z.union([z.number(), z.array(z.number())])
    )
    .optional(),
  name: z.string(),
  posts: z.array(PostIdSchema).optional(),
  authorId: z.preprocess(Number, z.number()).optional(),
});
export type TagType = z.infer<typeof TagSchema>;
export const TagBody = TagSchema.omit({
  id: true,
});
export const TagQuery = TagSchema.pick({
  id: true,
}).merge(PaginationSchema);
export const TagQuerySchema = z.object({
  query: TagQuery,
});
export const TagBodySchema = z.object({
  body: TagBody,
});
export const TagCreate = TagBodySchema;
export type TagCreateType = z.infer<typeof TagCreate>;
export const TagUpdate = TagBodySchema.merge(TagSingleQuerySchema);
export type TagUpdateType = z.infer<typeof TagUpdate>;
export const TagDelete = TagSingleQuerySchema;
export type TagDeleteType = z.infer<typeof TagDelete>;
export const TagFindOne = TagSingleQuerySchema;
export type TagFindOneType = z.infer<typeof TagFindOne>;
export const TagFindMany = TagQuerySchema;
export type TagFindManyType = z.infer<typeof TagFindMany>;
export const PostSchema = z.object({
  id: z
    .preprocess(
      (value) => (Array.isArray(value) ? value.map(Number) : Number(value)),
      z.union([z.number(), z.array(z.number())])
    )
    .optional(),
  title: z.string(),
  content: z.string().optional(),
  published: z.preprocess(Boolean, z.boolean()),
  authorId: z.preprocess(Number, z.number()).optional(),
  categoryId: z.preprocess(Number, z.number()),
  tags: z.array(TagIdSchema).optional(),
  likes: z.array(LikeIdSchema).optional(),
});
export type PostType = z.infer<typeof PostSchema>;
export const PostBody = PostSchema.omit({
  id: true,
});
export const PostQuery = PostSchema.pick({
  id: true,
}).merge(PaginationSchema);
export const PostQuerySchema = z.object({
  query: PostQuery,
});
export const PostBodySchema = z.object({
  body: PostBody,
});
export const PostCreate = PostBodySchema;
export type PostCreateType = z.infer<typeof PostCreate>;
export const PostUpdate = PostBodySchema.merge(PostSingleQuerySchema);
export type PostUpdateType = z.infer<typeof PostUpdate>;
export const PostDelete = PostSingleQuerySchema;
export type PostDeleteType = z.infer<typeof PostDelete>;
export const PostFindOne = PostSingleQuerySchema;
export type PostFindOneType = z.infer<typeof PostFindOne>;
export const PostFindMany = PostQuerySchema;
export type PostFindManyType = z.infer<typeof PostFindMany>;
export const UserSchema = z.object({
  id: z
    .preprocess(
      (value) => (Array.isArray(value) ? value.map(Number) : Number(value)),
      z.union([z.number(), z.array(z.number())])
    )
    .optional(),
  email: z.string(),
  name: z.string().optional(),
  posts: z.array(PostIdSchema).optional(),
  categories: z.array(CategoryIdSchema).optional(),
  tags: z.array(TagIdSchema).optional(),
  likes: z.array(LikeIdSchema).optional(),
});
export type UserType = z.infer<typeof UserSchema>;

export const UserBody = UserSchema.omit({
  id: true,
});

export const UserQuery = UserSchema.pick({
  id: true,
}).merge(PaginationSchema);

export const UserQuerySchema = z.object({
  query: UserQuery,
});

export const UserBodySchema = z.object({
  body: UserBody,
});

export const UserCreate = UserBodySchema;
export type UserCreateType = z.infer<typeof UserCreate>;
export const UserUpdate = UserBodySchema.merge(UserSingleQuerySchema);
export type UserUpdateType = z.infer<typeof UserUpdate>;
export const UserDelete = UserSingleQuerySchema;
export type UserDeleteType = z.infer<typeof UserDelete>;
export const UserFindOne = UserSingleQuerySchema;
export type UserFindOneType = z.infer<typeof UserFindOne>;
export const UserFindMany = UserQuerySchema;
export type UserFindManyType = z.infer<typeof UserFindMany>;
