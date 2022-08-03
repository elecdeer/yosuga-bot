import { PrismaClient } from "@prisma/client";

import { createGuildConfigAccessor } from "./generalConfig";
import { createUserConfigAccessor } from "./personalConfig";
import { createVoiceAccessor } from "./voice";

import type { IRepository } from "../interaface";

export const createRepositoryAccessor = (): IRepository => {
  const client = new PrismaClient();
  return {
    personalLevel: createUserConfigAccessor(client),
    generalLevel: createGuildConfigAccessor(client),
    voice: createVoiceAccessor(client),
  };
};
