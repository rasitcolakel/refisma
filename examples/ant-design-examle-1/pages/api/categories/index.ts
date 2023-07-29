import { NextApiResponse } from "next";
import { validateSchema } from "refisma";
import { runMiddleware } from "@services/Service";
import * as CategoryService from "@services/CategoryService";
import {
  CategoryCreate,
  CategoryCreateType,
  CategoryFindMany,
  CategoryFindManyType,
} from "@schemas/index";

const endpoints = [
  {
    method: "POST",
    handler: async (req: CategoryCreateType, res: NextApiResponse) =>
      validateSchema(CategoryCreate)(
        req,
        res,
        async (req: CategoryCreateType, res: NextApiResponse) => {
          try {
            const response = await CategoryService.createCategory(req);
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
    handler: async (req: CategoryFindManyType, res: NextApiResponse) =>
      validateSchema(CategoryFindMany)(
        req,
        res,
        async (req: CategoryFindManyType, res: NextApiResponse) => {
          try {
            const response = await CategoryService.getManyCategory(req);
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
