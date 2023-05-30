import React from "react";
import { useTranslate, HttpError, GetListResponse } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { PostSelect } from "@services/PostsService";
import {
  TextField,
  Checkbox,
  Autocomplete,
  FormControl,
  FormLabel,
  Stack,
} from "@mui/material";
import { useAutocomplete, Create } from "@refinedev/mui";
import { axiosInstance } from "@refinedev/simple-rest";
import dataProvider from "@refinedev/simple-rest";
import { User, Category, Prisma, Tag } from "@prisma/client";

interface Props {
  authorIdData: GetListResponse<User>;
  categoryIdData: GetListResponse<Category>;
  tagsData: GetListResponse<Tag>;
}

export default function PostCreate({
  authorIdData,
  categoryIdData,
  tagsData,
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
  } = useForm<PostSelect, HttpError>();

  const {
    autocompleteProps: authorIdAutocompleteProps,
    queryResult: authorIdQueryResult,
  } = useAutocomplete<User>({
    queryOptions: {
      initialData: authorIdData,
    },
    resource: "users",
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
    autocompleteProps: categoryIdAutocompleteProps,
    queryResult: categoryIdQueryResult,
  } = useAutocomplete<Category>({
    queryOptions: {
      initialData: categoryIdData,
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
    <Create
      isLoading={formLoading}
      saveButtonProps={{
        ...saveButtonProps,
        onClick: (e) => {
          const tagsValue = getValues().tags as Tag[];

          const tags: Prisma.TagUpdateManyWithoutPostsNestedInput = {
            connect: tagsValue,
          };
          setValue("tags", tags);

          saveButtonProps.onClick(e);
        },
      }}
    >
      <Stack gap="24px">
        <FormControl key={"title"}>
          <Controller
            control={control}
            name="title"
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
                  {t("table.title")}
                </FormLabel>
                <TextField
                  {...field}
                  {...register("title", {
                    required: t("errors.required.field", {
                      field: t("table.title"),
                    }),
                  })}
                  error={!!(errors as any)?.title}
                  helperText={(errors as any)?.title?.message}
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
        <FormControl key={"content"}>
          <Controller
            control={control}
            name="content"
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
                  {t("table.content")}
                </FormLabel>
                <TextField
                  {...field}
                  {...register("content", {
                    required: false,
                  })}
                  error={!!(errors as any)?.content}
                  helperText={(errors as any)?.content?.message}
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
        <FormControl key={"published"}>
          <Controller
            control={control}
            name="published"
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
                  {t("table.published")}
                </FormLabel>
                <Checkbox
                  {...field}
                  {...register("published", {
                    required: t("errors.required.field", {
                      field: t("table.published"),
                    }),
                  })}
                  color="primary"
                />
              </>
            )}
          />
        </FormControl>
        <FormControl key={"authorId"}>
          <Controller
            control={control}
            name="authorId"
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
                  {t("table.authorId")}
                </FormLabel>
                <Autocomplete
                  {...field}
                  {...register("authorId", {
                    required: false,
                  })}
                  {...authorIdAutocompleteProps}
                  onChange={(_, v: User | null) => {
                    if (v) {
                      field.onChange(v.id);
                    }
                  }}
                  getOptionLabel={(option) => option.email}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!(errors as any)?.authorId}
                      helperText={(errors as any)?.authorId?.message}
                      margin="none"
                      required
                      size="small"
                      variant="outlined"
                    />
                  )}
                />
              </>
            )}
          />
        </FormControl>
        <FormControl key={"categoryId"}>
          <Controller
            control={control}
            name="categoryId"
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
                  {t("table.categoryId")}
                </FormLabel>
                <Autocomplete
                  {...field}
                  {...register("categoryId", {
                    required: t("errors.required.field", {
                      field: t("table.categoryId"),
                    }),
                  })}
                  {...categoryIdAutocompleteProps}
                  onChange={(_, v: Category | null) => {
                    if (v) {
                      field.onChange(v.id);
                    }
                  }}
                  getOptionLabel={(option) => option.id.toString()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!(errors as any)?.categoryId}
                      helperText={(errors as any)?.categoryId?.message}
                      margin="none"
                      required
                      size="small"
                      variant="outlined"
                    />
                  )}
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
                />
              </>
            )}
          />
        </FormControl>
      </Stack>
    </Create>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authorIdData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getList({
    resource: "users",
  });
  const categoryIdData = await dataProvider(
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

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
      authorIdData,
      categoryIdData,
      tagsData,
    },
  };
};
