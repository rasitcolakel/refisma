import React from "react";
import {
  useTranslate,
  HttpError,
  GetListResponse,
  GetOneResponse,
} from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { TagSelect } from "@services/TagsService";
import {
  TextField,
  Autocomplete,
  FormControl,
  FormLabel,
  Stack,
} from "@mui/material";
import { useAutocomplete, Create, Edit } from "@refinedev/mui";
import { axiosInstance } from "@refinedev/simple-rest";
import dataProvider from "@refinedev/simple-rest";
import { User, Prisma, Post } from "@prisma/client";

interface Props {
  authorIdData: GetListResponse<User>;
  postsData: GetListResponse<Post>;
  idData: GetOneResponse<TagSelect>;
}

export default function TagCreate({ authorIdData, postsData, idData }: Props) {
  const t = useTranslate();
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TagSelect, HttpError>({
    refineCoreProps: {
      queryOptions: {
        initialData: idData,
      },
    },
  });

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

          saveButtonProps.onClick(e);
        },
      }}
    >
      <Stack gap="24px">
        <FormControl key={"name"}>
          <Controller
            control={control}
            name="name"
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
                  {t("table.name")}
                </FormLabel>
                <TextField
                  {...field}
                  {...register("name", {
                    required: t("errors.required.field", {
                      field: t("table.name"),
                    }),
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
                  defaultValue={authorIdAutocompleteProps.options.find(
                    (o) => o.id === idData?.data.authorId
                  )}
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
      </Stack>
    </Edit>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authorIdData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getList({
    resource: "users",
  });
  const postsData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getList({
    resource: "posts",
  });
  const idData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getOne({
    resource: "tags",
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
      authorIdData,
      postsData,
      idData,
    },
  };
};
