import React from "react";
import { useTranslate, HttpError, GetListResponse } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { Category, User } from "@prisma/client";
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

interface Props {
  authorIdData: GetListResponse<User>;
}

export default function CategoryCreate({ authorIdData }: Props) {
  const t = useTranslate();
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    control,
    formState: { errors },
  } = useForm<Category, HttpError>();

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
                    required: t("errors.required.field", {
                      field: t("table.authorId"),
                    }),
                  })}
                  {...authorIdAutocompleteProps}
                  onChange={(_, value: User | null) => {
                    if (value) {
                      field.onChange(value.id);
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
  const authorIdData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getList({
    resource: "users",
  });

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
      authorIdData,
    },
  };
};
