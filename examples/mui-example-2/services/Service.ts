/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const getPrisma = () => {
  let prisma: PrismaClient;
  if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }

    prisma = global.prisma as PrismaClient;
  }

  return prisma;
};

const cors = Cors({
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

function runMiddleware(req: any, res: any) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export { getPrisma, runMiddleware };
