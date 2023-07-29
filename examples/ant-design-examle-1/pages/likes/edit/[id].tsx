import React from "react";
import { AntdInferencer } from "@refinedev/inferencer/antd";

const fields = [
  { key: "id", type: "number", relation: false, multiple: false },
  {
    key: "postId",
    type: "relation",
    relation: true,
    multiple: false,
    resource: { name: "posts", route: "/posts" },
  },
  {
    key: "authorId",
    type: "relation",
    relation: true,
    multiple: false,
    resource: { name: "users", route: "/users" },
  },
];

const fieldTransformer = (field: any) => {
  const f = fields.find((f) => f.key === field.key);
  return f || field;
};

export default function Edit() {
  return (
    <AntdInferencer
      resource="likes"
      action="edit"
      fieldTransformer={fieldTransformer}
    />
  );
}