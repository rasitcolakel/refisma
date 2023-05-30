import React from "react";
import { useTranslate, HttpError, GetListResponse } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { UserSelect } from "@services/UsersService";
import { TextField, FormControl, FormLabel, Stack } from "@mui/material";
import { Edit } from "@refinedev/mui";
import { Prisma, Post, Category, Tag } from "@prisma/client";

interface Props {
  postsData: GetListResponse<Post>;
  categoriesData: GetListResponse<Category>;
  tagsData: GetListResponse<Tag>;
  idData: GetOneResponse<UserSelect>;
}

export default function UserCreate({
  postsData,
  categoriesData,
  tagsData,
  idData,
}: Props) {
  const t = useTranslate();
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<UserSelect, HttpError>({
    refineCoreProps: {
      queryOptions: {
        initialData: idData,
      },
    },
  });

  const {
    autocompleteProps: postsAutocompleteProps,
    queryResult: postsQueryResult,
  } = useAutocomplete<Post>({
    queryOptions: {
      initialData: postsData,
    },
    resource: "posts",
    liveMode: "auto",
    onSearch: (value: string) => [
      {
        field: "search",
        operator: "eq",
        value,
      },
    ],
  });
  const {
    autocompleteProps: categoriesAutocompleteProps,
    queryResult: categoriesQueryResult,
  } = useAutocomplete<Category>({
    queryOptions: {
      initialData: categoriesData,
    },
    resource: "categories",
    liveMode: "auto",
    onSearch: (value: string) => [
      {
        field: "search",
        operator: "eq",
        value,
      },
    ],
  });
  const {
    autocompleteProps: tagsAutocompleteProps,
    queryResult: tagsQueryResult,
  } = useAutocomplete<Tag>({
    queryOptions: {
      initialData: tagsData,
    },
    resource: "tags",
    liveMode: "auto",
    onSearch: (value: string) => [
      {
        field: "search",
        operator: "eq",
        value,
      },
    ],
  });

  return (
    <Edit
      isLoading={formLoading}
      saveButtonProps={{
        ...saveButtonProps,
        onClick: (e) => {
          const postsValue = getValues().posts as Post[];

          const oldposts = idData?.data.posts ?? [];
          const newposts = postsValue.filter(
            (o) => !oldposts.map((t) => t.id).includes(o.id)
          );
          const removedposts = oldposts.filter(
            (o) => !postsValue.map((t) => t.id).includes(o.id)
          );
          const posts: Prisma.TagUpdateManyWithoutPostsNestedInput = {
            connect: newposts,
            disconnect: removedposts,
          };
          setValue("posts", posts);
          const categoriesValue = getValues().categories as Category[];

          const oldcategories = idData?.data.categories ?? [];
          const newcategories = categoriesValue.filter(
            (o) => !oldcategories.map((t) => t.id).includes(o.id)
          );
          const removedcategories = oldcategories.filter(
            (o) => !categoriesValue.map((t) => t.id).includes(o.id)
          );
          const categories: Prisma.TagUpdateManyWithoutPostsNestedInput = {
            connect: newcategories,
            disconnect: removedcategories,
          };
          setValue("categories", categories);
          const tagsValue = getValues().tags as Tag[];

          const oldtags = idData?.data.tags ?? [];
          const newtags = tagsValue.filter(
            (o) => !oldtags.map((t) => t.id).includes(o.id)
          );
          const removedtags = oldtags.filter(
            (o) => !tagsValue.map((t) => t.id).includes(o.id)
          );
          const tags: Prisma.TagUpdateManyWithoutPostsNestedInput = {
            connect: newtags,
            disconnect: removedtags,
          };
          setValue("tags", tags);

          saveButtonProps.onClick(e);
        },
      }}
    >
      <Stack gap="24px">
        <FormControl key={"email"}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <>
                <FormLabel
                  required={true}
                  sx={{
                    marginBottom: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    color: "text.primary",
                  }}
                >
                  {t("table.email")}
                </FormLabel>
                <TextField
                  {...field}
                  {...register("email", {
                    required: t("errors.required.field", {
                      field: t("table.email"),
                    }),
                  })}
                  error={!!(errors as any)?.email}
                  helperText={(errors as any)?.email?.message}
                  margin="none"
                  required
                  size="small"
                  variant="outlined"
                  type="text"
                />
              </>
            )}
          />
        </FormControl>
        <FormControl key={"name"}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <>
                <FormLabel
                  required={false}
                  sx={{
                    marginBottom: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    color: "text.primary",
                  }}
                >
                  {t("table.name")}
                </FormLabel>
                <TextField
                  {...field}
                  {...register("name", {
                    required: false,
                  })}
                  error={!!(errors as any)?.name}
                  helperText={(errors as any)?.name?.message}
                  margin="none"
                  required
                  size="small"
                  variant="outlined"
                  type="text"
                />
              </>
            )}
          />
        </FormControl>
        <FormControl key={"posts"}>
          <Controller
            control={control}
            name="posts"
            render={({ field }) => (
              <>
                <FormLabel
                  required={false}
                  sx={{
                    marginBottom: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    color: "text.primary",
                  }}
                >
                  {t("table.posts")}
                </FormLabel>
                <Autocomplete
                  {...field}
                  {...register("posts", {
                    required: false,
                  })}
                  {...postsAutocompleteProps}
                  onChange={(_, v: Post[] | null) => {
                    if (v) {
                      field.onChange(v);
                    }
                  }}
                  getOptionLabel={(option) => option.title}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!(errors as any)?.posts}
                      helperText={(errors as any)?.posts?.message}
                      margin="none"
                      required
                      size="small"
                      variant="outlined"
                    />
                  )}
                  multiple
                  defaultValue={idData?.data.posts || []}
                />
              </>
            )}
          />
        </FormControl>
        <FormControl key={"categories"}>
          <Controller
            control={control}
            name="categories"
            render={({ field }) => (
              <>
                <FormLabel
                  required={false}
                  sx={{
                    marginBottom: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    color: "text.primary",
                  }}
                >
                  {t("table.categories")}
                </FormLabel>
                <Autocomplete
                  {...field}
                  {...register("categories", {
                    required: false,
                  })}
                  {...categoriesAutocompleteProps}
                  onChange={(_, v: Category[] | null) => {
                    if (v) {
                      field.onChange(v);
                    }
                  }}
                  getOptionLabel={(option) => option.id.toString()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!(errors as any)?.categories}
                      helperText={(errors as any)?.categories?.message}
                      margin="none"
                      required
                      size="small"
                      variant="outlined"
                    />
                  )}
                  multiple
                  defaultValue={idData?.data.categories || []}
                />
              </>
            )}
          />
        </FormControl>
        <FormControl key={"tags"}>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <>
                <FormLabel
                  required={false}
                  sx={{
                    marginBottom: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    color: "text.primary",
                  }}
                >
                  {t("table.tags")}
                </FormLabel>
                <Autocomplete
                  {...field}
                  {...register("tags", {
                    required: false,
                  })}
                  {...tagsAutocompleteProps}
                  onChange={(_, v: Tag[] | null) => {
                    if (v) {
                      field.onChange(v);
                    }
                  }}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!(errors as any)?.tags}
                      helperText={(errors as any)?.tags?.message}
                      margin="none"
                      required
                      size="small"
                      variant="outlined"
                    />
                  )}
                  multiple
                  defaultValue={idData?.data.tags || []}
                />
              </>
            )}
          />
        </FormControl>
      </Stack>
    </Edit>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const postsData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getList({
    resource: "posts",
  });
  const categoriesData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getList({
    resource: "categories",
  });
  const tagsData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getList({
    resource: "tags",
  });
  const idData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getOne({
    resource: "users",
    id: context.query.id as string,
  });

  if (!idData.data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
      postsData,
      categoriesData,
      tagsData,
      idData,
    },
  };
};
