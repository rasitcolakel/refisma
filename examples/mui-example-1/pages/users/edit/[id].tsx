import React from "react";
import { useTranslate, HttpError } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { User } from "@prisma/client";
import { TextField, FormControl, FormLabel, Stack } from "@mui/material";
import { Edit } from "@refinedev/mui";

interface Props {
  idData: GetOneResponse<User>;
}

export default function UserCreate({ idData }: Props) {
  const t = useTranslate();
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    control,
    formState: { errors },
  } = useForm<User, HttpError>({
    refineCoreProps: {
      queryOptions: {
        initialData: idData,
      },
    },
  });

  return (
    <Edit isLoading={formLoading} saveButtonProps={saveButtonProps}>
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
      </Stack>
    </Edit>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
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
      idData,
    },
  };
};
