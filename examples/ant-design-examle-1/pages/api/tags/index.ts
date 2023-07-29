import { NextApiResponse } from "next";
import { validateSchema } from "refisma";
import { runMiddleware } from "@services/Service";
import * as TagService from "@services/TagService";
import {
  TagCreate,
  TagCreateType,
  TagFindMany,
  TagFindManyType,
} from "@schemas/index";

const endpoints = [
  {
    method: "POST",
    handler: async (req: TagCreateType, res: NextApiResponse) =>
      validateSchema(TagCreate)(
        req,
        res,
        async (req: TagCreateType, res: NextApiResponse) => {
          try {
            const response = await TagService.createTag(req);
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
    handler: async (req: TagFindManyType, res: NextApiResponse) =>
      validateSchema(TagFindMany)(
        req,
        res,
        async (req: TagFindManyType, res: NextApiResponse) => {
          try {
            const response = await TagService.getManyTag(req);
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
