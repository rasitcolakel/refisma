import React from "react";
import { useTranslate, HttpError, GetListResponse } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { Post, User, Category } from "@prisma/client";
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

interface Props {
  userIdData: GetListResponse<User>;
  categoryIdData: GetListResponse<Category>;
}

export default function PostCreate({ userIdData, categoryIdData }: Props) {
  const t = useTranslate();
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    control,
    formState: { errors },
  } = useForm<Post, HttpError>();

  const {
    autocompleteProps: userIdAutocompleteProps,
    queryResult: userIdQueryResult,
  } = useAutocomplete<User>({
    queryOptions: {
      initialData: userIdData,
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

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
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
                    required: t("errors.required.field", {
                      field: t("table.content"),
                    }),
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
        <FormControl key={"userId"}>
          <Controller
            control={control}
            name="userId"
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
                  {t("table.userId")}
                </FormLabel>
                <Autocomplete
                  {...field}
                  {...register("userId", {
                    required: t("errors.required.field", {
                      field: t("table.userId"),
                    }),
                  })}
                  {...userIdAutocompleteProps}
                  onChange={(_, value: User | null) => {
                    if (value) {
                      field.onChange(value.id);
                    }
                  }}
                  getOptionLabel={(option) => option.email}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!(errors as any)?.userId}
                      helperText={(errors as any)?.userId?.message}
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
                  onChange={(_, value: Category | null) => {
                    if (value) {
                      field.onChange(value.id);
                    }
                  }}
                  getOptionLabel={(option) => option.name}
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
      </Stack>
    </Create>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userIdData = await dataProvider(
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

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
      userIdData,
      categoryIdData,
    },
  };
};
