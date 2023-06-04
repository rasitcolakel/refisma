import React from "react";
import { useTranslate, HttpError, GetListResponse } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { LikeSelect } from "@services/LikesService";
import {
  Autocomplete,
  TextField,
  FormControl,
  FormLabel,
  Stack,
} from "@mui/material";
import { useAutocomplete, Create, Edit } from "@refinedev/mui";
import { axiosInstance } from "@refinedev/simple-rest";
import dataProvider from "@refinedev/simple-rest";
import { Post, User, Prisma } from "@prisma/client";

interface Props {
  postIdData: GetListResponse<Post>;
  authorIdData: GetListResponse<User>;
}

export default function LikeCreate({ postIdData, authorIdData }: Props) {
  const t = useTranslate();
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    control,
    formState: { errors },
  } = useForm<LikeSelect, HttpError>();

  const {
    autocompleteProps: postIdAutocompleteProps,
    queryResult: postIdQueryResult,
  } = useAutocomplete<Post>({
    queryOptions: {
      initialData: postIdData,
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

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Stack gap="24px">
        <FormControl key={"postId"}>
          <Controller
            control={control}
            name="postId"
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
                  {t("table.postId")}
                </FormLabel>
                <Autocomplete
                  {...field}
                  {...register("postId", {
                    required: t("errors.required.field", {
                      field: t("table.postId"),
                    }),
                  })}
                  {...postIdAutocompleteProps}
                  onChange={(_, v: Post | null) => {
                    if (v) {
                      field.onChange(v.id);
                    }
                  }}
                  getOptionLabel={(option) => option.title}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!(errors as any)?.postId}
                      helperText={(errors as any)?.postId?.message}
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
      </Stack>
    </Create>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const postIdData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getList({
    resource: "posts",
  });
  const authorIdData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getList({
    resource: "users",
  });

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
      postIdData,
      authorIdData,
    },
  };
};
