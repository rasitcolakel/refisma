import { NextApiRequest, NextApiResponse } from "next";
import { createPost, findManyPost } from "@services/PostsService";
import { createPostSchema, findManyPostSchema } from "@schemas/PostsSchema";
import { Prisma } from "@prisma/client";
import { validateSchema } from "refisma";

// Types for the requests
type createRequest = NextApiRequest & {
  body: Prisma.PostCreateInput;
};
type findManyRequest = NextApiRequest;

const endpoints = [
  {
    method: "POST",
    handler: async (req: createRequest, res: NextApiResponse) =>
      validateSchema(createPostSchema)(
        req,
        res,
        async (req: createRequest, res: NextApiResponse) => {
          try {
            const response = await createPost(req.body);
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
    handler: async (req: findManyRequest, res: NextApiResponse) =>
      validateSchema(findManyPostSchema)(
        req,
        res,
        async (req: findManyRequest, res: NextApiResponse) => {
          try {
            const response = await findManyPost();
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
