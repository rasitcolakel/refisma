import React from "react";
import { useTranslate, useShow, GetOneResponse } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { TagSelect } from "@services/TagsService";
import { Show } from "@refinedev/mui";
import { Typography, Stack } from "@mui/material";
import { axiosInstance } from "@refinedev/simple-rest";
import dataProvider from "@refinedev/simple-rest";

interface Props {
  idData: GetOneResponse<TagSelect>;
}

export default function TagCreate({ idData }: Props) {
  const t = useTranslate();
  const { queryResult } = useShow<TagSelect>({
    resource: "tags",
    queryOptions: {
      initialData: idData,
    },
  });
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1" fontWeight="bold" key="Tag-id">
          {t("table.id")}
        </Typography>
        <Typography>{record?.id}</Typography>
        <Typography variant="body1" fontWeight="bold" key="Tag-name">
          {t("table.name")}
        </Typography>
        <Typography>{record?.name}</Typography>
        <Typography variant="body1" fontWeight="bold" key="Tag-authorId">
          {t("table.authorId")}
        </Typography>
        <Typography>{record?.author?.email}</Typography>
      </Stack>
    </Show>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
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
      idData,
    },
  };
};
