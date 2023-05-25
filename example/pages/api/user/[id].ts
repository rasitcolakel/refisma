import { NextApiRequest, NextApiResponse } from "next";
import { getByIdUser, updateUser, deleteUser } from "@services/UserService";
import {
  getByIdUserSchema,
  updateUserSchema,
  deleteUserSchema,
} from "@schemas/UserSchema";
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
  body: Prisma.UserUpdateInput;
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
      validateSchema(getByIdUserSchema)(
        req,
        res,
        async (req: getByIdRequest, res: NextApiResponse) => {
          try {
            const response = await getByIdUser(req.query.id);
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
      validateSchema(updateUserSchema)(
        req,
        res,
        async (req: updateRequest, res: NextApiResponse) => {
          try {
            const response = await updateUser(req.query.id, req.body);
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
      validateSchema(deleteUserSchema)(
        req,
        res,
        async (req: deleteRequest, res: NextApiResponse) => {
          try {
            const response = await deleteUser(req.query.id);
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
