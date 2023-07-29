import React from "react";
import { MuiInferencer } from "@refinedev/inferencer/mui";

const fields = [
  { key: "id", type: "number", relation: false, multiple: false },
  { key: "title", type: "text", relation: false, multiple: false },
  { key: "content", type: "text", relation: false, multiple: false },
  { key: "published", type: "boolean", relation: false, multiple: false },
  {
    key: "authorId",
    type: "relation",
    relation: true,
    multiple: false,
    resource: { name: "users", route: "/users" },
  },
  {
    key: "categoryId",
    type: "relation",
    relation: true,
    multiple: false,
    resource: { name: "categories", route: "/categories" },
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

export default function Edit() {
  return (
    <MuiInferencer
      resource="posts"
      action="edit"
      fieldTransformer={fieldTransformer}
    />
  );
}
