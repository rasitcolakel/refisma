import { NextApiRequest, NextApiResponse } from "next";
import { getByIdPost, updatePost, deletePost } from "@services/PostService";
import {
  getByIdPostSchema,
  updatePostSchema,
  deletePostSchema,
} from "@schemas/PostSchema";
import { Prisma } from "@prisma/client";
import { validateSchema } from "refisma";

// Types for the requests
type getByIdRequest = NextApiRequest & {
  query: {
    id: number;
  };
};
type updateRequest = NextApiRequest & {
  query: {
    id: number;
  };
  body: Prisma.PostUpdateInput;
};
type deleteRequest = NextApiRequest & {
  query: {
    id: number;
  };
};

const endpoints = [
  {
    method: "GET",
    handler: async (req: getByIdRequest, res: NextApiResponse) =>
      validateSchema(getByIdPostSchema)(
        req,
        res,
        async (req: getByIdRequest, res: NextApiResponse) => {
          try {
            const response = await getByIdPost(req.query.id);
            res.status(200).json(response);
          } catch (error: any) {
            res.status(500).json({
              message: error.message,
            });
          }
        }
      ),
  },
  {
    method: "PATCH",
    handler: async (req: updateRequest, res: NextApiResponse) =>
      validateSchema(updatePostSchema)(
        req,
        res,
        async (req: updateRequest, res: NextApiResponse) => {
          try {
            const response = await updatePost(req.query.id, req.body);
            res.status(200).json(response);
          } catch (error: any) {
            res.status(500).json({
              message: error.message,
            });
          }
        }
      ),
  },
  {
    method: "DELETE",
    handler: async (req: deleteRequest, res: NextApiResponse) =>
      validateSchema(deletePostSchema)(
        req,
        res,
        async (req: deleteRequest, res: NextApiResponse) => {
          try {
            const response = await deletePost(req.query.id);
            res.status(200).json(response);
          } catch (error: any) {
            res.status(500).json({
              message: error.message,
            });
          }
        }
      ),
  },
];

const handler = async (req: any, res: NextApiResponse) => {
  const endpoint = endpoints.find((endpoint) => endpoint.method === req.method);

  if (!endpoint) {
    res.status(404).json({
      message: "Not found",
    });
  } else {
    endpoint.handler(req, res);
  }
};

export default handler;
