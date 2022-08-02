import { PrismaClient } from "@prisma/client";

import { createGuildConfigAccessor } from "./guildConfig";
import { createUserConfigAccessor } from "./userConfig";
import { createVoiceAccessor } from "./voice";

import type { IRepository } from "../interaface";

export const createRepositoryAccessor = (): IRepository => {
  const client = new PrismaClient();
  return {
    userLevel: createUserConfigAccessor(client),
    guildLevel: createGuildConfigAccessor(client),
    voice: createVoiceAccessor(client),
  };
};
