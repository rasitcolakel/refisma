import { NextApiResponse } from "next";
import { validateSchema } from "refisma";
import { runMiddleware } from "@services/Service";
import * as PostService from "@services/PostService";
import {
  PostCreate,
  PostCreateType,
  PostFindMany,
  PostFindManyType,
} from "@schemas/index";

const endpoints = [
  {
    method: "POST",
    handler: async (req: PostCreateType, res: NextApiResponse) =>
      validateSchema(PostCreate)(
        req,
        res,
        async (req: PostCreateType, res: NextApiResponse) => {
          try {
            const response = await PostService.createPost(req);
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
    handler: async (req: PostFindManyType, res: NextApiResponse) =>
      validateSchema(PostFindMany)(
        req,
        res,
        async (req: PostFindManyType, res: NextApiResponse) => {
          try {
            const response = await PostService.getManyPost(req);
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
