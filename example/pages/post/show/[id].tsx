import React from "react";
import { useTranslate, useShow, GetOneResponse } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Show } from "@refinedev/mui";
import { Stack, Typography } from "@mui/material";
import { PostSelect } from "@services/PostService";
import { axiosInstance } from "@refinedev/simple-rest";
import dataProvider from "@refinedev/simple-rest";

interface Props {
  idData: GetOneResponse<PostSelect>;
}

export default function PostCreate({ idData }: Props) {
  const t = useTranslate();
  const { queryResult } = useShow<PostSelect>({
    resource: "post",
    queryOptions: {
      initialData: idData,
    },
  });
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1" fontWeight="bold" key="Post-id">
          {t("table.id")}
        </Typography>
        <Typography>{record?.id}</Typography>
        <Typography variant="body1" fontWeight="bold" key="Post-title">
          {t("table.title")}
        </Typography>
        <Typography>{record?.title}</Typography>
        <Typography variant="body1" fontWeight="bold" key="Post-content">
          {t("table.content")}
        </Typography>
        <Typography>{record?.content}</Typography>
        <Typography variant="body1" fontWeight="bold" key="Post-published">
          {t("table.published")}
        </Typography>
        <Typography>{record?.published}</Typography>
        <Typography variant="body1" fontWeight="bold" key="Post-authorId">
          {t("table.authorId")}
        </Typography>
        <Typography>{record?.author?.email}</Typography>
        <Typography variant="body1" fontWeight="bold" key="Post-categoryId">
          {t("table.categoryId")}
        </Typography>
        <Typography>{record?.category.id}</Typography>
      </Stack>
    </Show>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const idData = await dataProvider(
    process.env.NEXT_PUBLIC_SERVER_API_URL as string,
    axiosInstance
  ).getOne({
    resource: "post",
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
