import React from "react";
import { MuiInferencer } from "@refinedev/inferencer/mui";

const fields = [
  { key: "id", type: "number", relation: false, multiple: false },
  { key: "name", type: "text", relation: false, multiple: false },
  {
    key: "authorId",
    type: "relation",
    relation: true,
    multiple: false,
    resource: { name: "users", route: "/users" },
  },
  {
    key: "posts",
    type: "relation",
    relation: true,
    multiple: true,
    resource: { name: "posts", route: "/posts" },
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
      resource="categories"
      action="list"
      fieldTransformer={fieldTransformer}
    />
  );
}
