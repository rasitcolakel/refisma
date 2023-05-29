import React from "react";
import { Post } from "@prisma/client";
import { useTranslate } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";
import { DataGrid, GridColumns } from "@mui/x-data-grid";

export default function PostList() {
  const t = useTranslate();
  const { dataGridProps } = useDataGrid<Post>();

  const columns = React.useMemo<GridColumns<Post>>(
    () => [
      {
        field: "id",
        flex: 1,
        headerName: t("table.id"),
      },
      {
        field: "title",
        flex: 1,
        headerName: t("table.title"),
      },
      {
        field: "content",
        flex: 1,
        headerName: t("table.content"),
      },
      {
        field: "published",
        flex: 1,
        headerName: t("table.published"),
      },
      {
        field: "userId",
        flex: 1,
        headerName: t("table.userId"),
      },
      {
        field: "categoryId",
        flex: 1,
        headerName: t("table.categoryId"),
      },
      {
        field: "actions",
        headerName: t("table.actions"),
        flex: 1,
        renderCell: function render({ row }) {
          return (
            <>
              <ShowButton hideText recordItemId={row.id} />
              <EditButton hideText recordItemId={row.id} />
              <DeleteButton hideText recordItemId={row.id} />
            </>
          );
        },
      },
    ],
    [t]
  );
  return (
    <List canCreate>
      <DataGrid
        {...dataGridProps}
        autoHeight
        columns={columns}
        density="comfortable"
      />
    </List>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
    },
  };
};
