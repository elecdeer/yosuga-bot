import { createPrismaRepository } from "./prisma/prismaRepository";

import type { IRepository } from "./interaface";

type IdentifierType = "app" | "guild" | "user";

export const createRepository = (): IRepository => {
  return createPrismaRepository();
};
