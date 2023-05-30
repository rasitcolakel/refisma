import { NextApiRequest, NextApiResponse } from "next";
import { getByIdTag, updateTag, deleteTag } from "@services/TagsService";
import {
  getByIdTagSchema,
  updateTagSchema,
  deleteTagSchema,
} from "@schemas/TagsSchema";
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
  body: Prisma.TagUpdateInput;
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
      validateSchema(getByIdTagSchema)(
        req,
        res,
        async (req: getByIdRequest, res: NextApiResponse) => {
          try {
            const response = await getByIdTag(req.query.id);
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
      validateSchema(updateTagSchema)(
        req,
        res,
        async (req: updateRequest, res: NextApiResponse) => {
          try {
            const response = await updateTag(req.query.id, req.body);
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
      validateSchema(deleteTagSchema)(
        req,
        res,
        async (req: deleteRequest, res: NextApiResponse) => {
          try {
            const response = await deleteTag(req.query.id);
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
