import { NextApiResponse } from "next";
import { validateSchema } from "refisma";
import { runMiddleware } from "@services/Service";
import * as CategoryService from "@services/CategoryService";
import {
  CategoryFindOne,
  CategoryFindOneType,
  CategoryUpdate,
  CategoryUpdateType,
  CategoryDelete,
  CategoryDeleteType,
} from "@schemas/index";

const endpoints = [
  {
    method: "GET",
    handler: async (req: CategoryFindOneType, res: NextApiResponse) =>
      validateSchema(CategoryFindOne)(
        req,
        res,
        async (req: CategoryFindOneType, res: NextApiResponse) => {
          try {
            const response = await CategoryService.getOneCategory(req);
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
    handler: async (req: CategoryUpdateType, res: NextApiResponse) =>
      validateSchema(CategoryUpdate)(
        req,
        res,
        async (req: CategoryUpdateType, res: NextApiResponse) => {
          try {
            const response = await CategoryService.updateCategory(req);
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
    handler: async (req: CategoryDeleteType, res: NextApiResponse) =>
      validateSchema(CategoryDelete)(
        req,
        res,
        async (req: CategoryDeleteType, res: NextApiResponse) => {
          try {
            const response = await CategoryService.deleteCategory(req);
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
