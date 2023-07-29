import { NextApiResponse } from "next";
import { validateSchema } from "refisma";
import { runMiddleware } from "@services/Service";
import * as LikeService from "@services/LikeService";
import {
  LikeCreate,
  LikeCreateType,
  LikeFindMany,
  LikeFindManyType,
} from "@schemas/index";

const endpoints = [
  {
    method: "POST",
    handler: async (req: LikeCreateType, res: NextApiResponse) =>
      validateSchema(LikeCreate)(
        req,
        res,
        async (req: LikeCreateType, res: NextApiResponse) => {
          try {
            const response = await LikeService.createLike(req);
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
    handler: async (req: LikeFindManyType, res: NextApiResponse) =>
      validateSchema(LikeFindMany)(
        req,
        res,
        async (req: LikeFindManyType, res: NextApiResponse) => {
          try {
            const response = await LikeService.getManyLike(req);
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
