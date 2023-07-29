import { NextApiResponse } from "next";
import { validateSchema } from "refisma";
import { runMiddleware } from "@services/Service";
import * as UserService from "@services/UserService";
import {
  UserCreate,
  UserCreateType,
  UserFindMany,
  UserFindManyType,
} from "@schemas/index";

const endpoints = [
  {
    method: "POST",
    handler: async (req: UserCreateType, res: NextApiResponse) =>
      validateSchema(UserCreate)(
        req,
        res,
        async (req: UserCreateType, res: NextApiResponse) => {
          try {
            const response = await UserService.createUser(req);
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
    method: "GET",
    handler: async (req: UserFindManyType, res: NextApiResponse) =>
      validateSchema(UserFindMany)(
        req,
        res,
        async (req: UserFindManyType, res: NextApiResponse) => {
          try {
            const response = await UserService.getManyUser(req);
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
