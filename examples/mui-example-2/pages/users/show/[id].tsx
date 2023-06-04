import React from "react";
import { useTranslate, useShow, GetOneResponse } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { UserSelect } from "@services/UsersService";
import { Show, TagField } from "@refinedev/mui";
import { Typography, Stack } from "@mui/material";
import { axiosInstance } from "@refinedev/simple-rest";
import dataProvider from "@refinedev/simple-rest";

interface Props {
  idData: GetOneResponse<UserSelect>;
}

export default function UserCreate({ idData }: Props) {
  const t = useTranslate();
  const { queryResult } = useShow<UserSelect>({
    resource: "users",
    queryOptions: {
      initialData: idData,
    },
  });
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1" fontWeight="bold" key="User-id">
          {t("table.id")}
        </Typography>
        <Typography>{record?.id}</Typography>
        <Typography variant="body1" fontWeight="bold" key="User-email">
          {t("table.email")}
        </Typography>
        <Typography>{record?.email}</Typography>
        <Typography variant="body1" fontWeight="bold" key="User-name">
          {t("table.name")}
        </Typography>
        <Typography>{record?.name}</Typography>
        <Typography variant="body1" fontWeight="bold" key="User-posts">
          {t("table.posts")}
        </Typography>
        <Stack direction="row" spacing={1}>
          {record?.posts?.map((item) => (
            <TagField value={item.title} key={item.id} />
          ))}
        </Stack>
      </Stack>
    </Show>
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
