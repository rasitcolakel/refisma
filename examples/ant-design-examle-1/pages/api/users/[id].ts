import { NextApiResponse } from "next";
import { validateSchema } from "refisma";
import { runMiddleware } from "@services/Service";
import * as UserService from "@services/UserService";
import {
  UserFindOne,
  UserFindOneType,
  UserUpdate,
  UserUpdateType,
  UserDelete,
  UserDeleteType,
} from "@schemas/index";

const endpoints = [
  {
    method: "GET",
    handler: async (req: UserFindOneType, res: NextApiResponse) =>
      validateSchema(UserFindOne)(
        req,
        res,
        async (req: UserFindOneType, res: NextApiResponse) => {
          try {
            const response = await UserService.getOneUser(req);
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
    method: ["PUT", "PATCH"],
    handler: async (req: UserUpdateType, res: NextApiResponse) =>
      validateSchema(UserUpdate)(
        req,
        res,
        async (req: UserUpdateType, res: NextApiResponse) => {
          try {
            const response = await UserService.updateUser(req);
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
    handler: async (req: UserDeleteType, res: NextApiResponse) =>
      validateSchema(UserDelete)(
        req,
        res,
        async (req: UserDeleteType, res: NextApiResponse) => {
          try {
            const response = await UserService.deleteUser(req);
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
  const endpoint = endpoints.find(
    (endpoint) =>
      endpoint.method === req.method || endpoint.method.includes(req.method)
  );
  await runMiddleware(req, res);

  if (!endpoint) {
    res.status(404).json({
      message: "Not found",
    });
  } else {
    endpoint.handler(req, res);
  }
};

export default handler;
