import { NextApiResponse } from "next";
import { validateSchema } from "refisma";
import { runMiddleware } from "@services/Service";
import * as TagService from "@services/TagService";
import {
  TagFindOne,
  TagFindOneType,
  TagUpdate,
  TagUpdateType,
  TagDelete,
  TagDeleteType,
} from "@schemas/index";

const endpoints = [
  {
    method: "GET",
    handler: async (req: TagFindOneType, res: NextApiResponse) =>
      validateSchema(TagFindOne)(
        req,
        res,
        async (req: TagFindOneType, res: NextApiResponse) => {
          try {
            const response = await TagService.getOneTag(req);
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
    handler: async (req: TagUpdateType, res: NextApiResponse) =>
      validateSchema(TagUpdate)(
        req,
        res,
        async (req: TagUpdateType, res: NextApiResponse) => {
          try {
            const response = await TagService.updateTag(req);
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
    handler: async (req: TagDeleteType, res: NextApiResponse) =>
      validateSchema(TagDelete)(
        req,
        res,
        async (req: TagDeleteType, res: NextApiResponse) => {
          try {
            const response = await TagService.deleteTag(req);
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
