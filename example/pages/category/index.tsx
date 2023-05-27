import React from "react";
import { DataGrid, GridColumns } from "@mui/x-data-grid";
import { Category } from "@prisma/client";
import { useTranslate } from "@refinedev/core";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function CategoryList() {
  const t = useTranslate();
  const { dataGridProps } = useDataGrid<Category>();

  const columns = React.useMemo<GridColumns<Category>>(
    () => [
      {
        field: "id",
        flex: 1,
        headerName: t("table.id"),
      },
      {
        field: "name",
        flex: 1,
        headerName: t("table.name"),
      },
      {
        field: "authorId",
        flex: 1,
        headerName: t("table.authorId"),
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
