import React from "react";
import { TagSelect } from "@services/TagsService";
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

export default function TagList() {
  const t = useTranslate();
  const { dataGridProps } = useDataGrid<TagSelect>();

  const columns = React.useMemo<GridColumns<TagSelect>>(
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
