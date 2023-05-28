import React from "react";
import { DataGrid, GridColumns } from "@mui/x-data-grid";
import { User } from "@prisma/client";
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

export default function UserList() {
  const t = useTranslate();
  const { dataGridProps } = useDataGrid<User>();

  const columns = React.useMemo<GridColumns<User>>(
    () => [
      {
        field: "id",
        flex: 1,
        headerName: t("table.id"),
      },
      {
        field: "email",
        flex: 1,
        headerName: t("table.email"),
      },
      {
        field: "name",
        flex: 1,
        headerName: t("table.name"),
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
