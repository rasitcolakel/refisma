import { NextApiResponse } from "next";
import { validateSchema } from "refisma";
import { runMiddleware } from "@services/Service";
import * as PostService from "@services/PostService";
import {
  PostFindOne,
  PostFindOneType,
  PostUpdate,
  PostUpdateType,
  PostDelete,
  PostDeleteType,
} from "@schemas/index";

const endpoints = [
  {
    method: "GET",
    handler: async (req: PostFindOneType, res: NextApiResponse) =>
      validateSchema(PostFindOne)(
        req,
        res,
        async (req: PostFindOneType, res: NextApiResponse) => {
          try {
            const response = await PostService.getOnePost(req);
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
    handler: async (req: PostUpdateType, res: NextApiResponse) =>
      validateSchema(PostUpdate)(
        req,
        res,
        async (req: PostUpdateType, res: NextApiResponse) => {
          try {
            const response = await PostService.updatePost(req);
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
    handler: async (req: PostDeleteType, res: NextApiResponse) =>
      validateSchema(PostDelete)(
        req,
        res,
        async (req: PostDeleteType, res: NextApiResponse) => {
          try {
            const response = await PostService.deletePost(req);
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
