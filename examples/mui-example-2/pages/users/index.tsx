import React from "react";
import { MuiInferencer } from "@refinedev/inferencer/mui";

const fields = [
  { key: "id", type: "number", relation: false, multiple: false },
  { key: "email", type: "text", relation: false, multiple: false },
  { key: "name", type: "text", relation: false, multiple: false },
  {
    key: "posts",
    type: "relation",
    relation: true,
    multiple: true,
    resource: { name: "posts", route: "/posts" },
    relationInfer: { accessor: "id", key: "id", type: "relation" },
    accessor: "id",
  },
  {
    key: "categories",
    type: "relation",
    relation: true,
    multiple: true,
    resource: { name: "categories", route: "/categories" },
    relationInfer: { accessor: "id", key: "id", type: "relation" },
    accessor: "id",
  },
  {
    key: "tags",
    type: "relation",
    relation: true,
    multiple: true,
    resource: { name: "tags", route: "/tags" },
    relationInfer: { accessor: "id", key: "id", type: "relation" },
    accessor: "id",
  },
  {
    key: "likes",
    type: "relation",
    relation: true,
    multiple: true,
    resource: { name: "likes", route: "/likes" },
    relationInfer: { accessor: "id", key: "id", type: "relation" },
    accessor: "id",
  },
];

const fieldTransformer = (field: any) => {
  const f = fields.find((f) => f.key === field.key);
  return f || field;
};

export default function List() {
  return (
    <MuiInferencer
      resource="users"
      action="list"
      fieldTransformer={fieldTransformer}
    />
  );
}
