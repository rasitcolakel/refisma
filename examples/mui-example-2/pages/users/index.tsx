import React from "react";
import { UserSelect } from "@services/UsersService";
import { useTranslate } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useDataGrid,
  TagField,
} from "@refinedev/mui";
import { DataGrid, GridColumns } from "@mui/x-data-grid";

export default function UserList() {
  const t = useTranslate();
  const { dataGridProps } = useDataGrid<UserSelect>();

  const columns = React.useMemo<GridColumns<UserSelect>>(
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
        field: "posts",
        flex: 1,
        headerName: t("table.posts"),
        renderCell: function render({ row }) {
          return (
            <>
              {row.posts?.map((item) => (
                <TagField value={item.title} key={item.id} />
              ))}
            </>
          );
        },
      },
      {
        field: "categories",
        flex: 1,
        headerName: t("table.categories"),
        renderCell: function render({ row }) {
          return (
            <>
              {row.categories?.map((item) => (
                <TagField value={item.id} key={item.id} />
              ))}
            </>
          );
        },
      },
      {
        field: "tags",
        flex: 1,
        headerName: t("table.tags"),
        renderCell: function render({ row }) {
          return (
            <>
              {row.tags?.map((item) => (
                <TagField value={item.name} key={item.id} />
              ))}
            </>
          );
        },
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
