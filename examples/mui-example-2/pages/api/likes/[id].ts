import { NextApiResponse } from "next";
import { validateSchema } from "refisma";
import { runMiddleware } from "@services/Service";
import * as LikeService from "@services/LikeService";
import {
  LikeFindOne,
  LikeFindOneType,
  LikeUpdate,
  LikeUpdateType,
  LikeDelete,
  LikeDeleteType,
} from "@schemas/index";

const endpoints = [
  {
    method: "GET",
    handler: async (req: LikeFindOneType, res: NextApiResponse) =>
      validateSchema(LikeFindOne)(
        req,
        res,
        async (req: LikeFindOneType, res: NextApiResponse) => {
          try {
            const response = await LikeService.getOneLike(req);
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
    handler: async (req: LikeUpdateType, res: NextApiResponse) =>
      validateSchema(LikeUpdate)(
        req,
        res,
        async (req: LikeUpdateType, res: NextApiResponse) => {
          try {
            const response = await LikeService.updateLike(req);
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
    handler: async (req: LikeDeleteType, res: NextApiResponse) =>
      validateSchema(LikeDelete)(
        req,
        res,
        async (req: LikeDeleteType, res: NextApiResponse) => {
          try {
            const response = await LikeService.deleteLike(req);
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
