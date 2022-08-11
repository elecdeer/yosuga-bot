import { parseVoiceNullable } from "../voiceParamSchema";

import type { IRepository } from "../interaface";
import type { PrismaClient } from "@prisma/client";

export const createUserConfigAccessor = (client: PrismaClient): IRepository["personalLevel"] => {
  return {
    create: async (value) => {
      return await client.personal.create({
        data: value,
      });
    },
    read: async (snowflake) => {
      const rawData = await client.personal.findFirst({
        where: {
          snowflake: snowflake,
        },
        include: {
          voice: true,
        },
      });

      if (rawData === null) return null;
      return {
        ...rawData,
        voice: parseVoiceNullable(rawData.voice),
      };
    },
    update: async (snowflake, value) => {
      return await client.personal.update({
        where: {
          snowflake: snowflake,
        },
        data: value,
      });
    },
    upsert: async (snowflake, value) => {
      return await client.personal.upsert({
        where: {
          snowflake: snowflake,
        },
        update: value,
        create: value,
      });
    },
    delete: async (snowflake) => {
      await client.personal.delete({
        where: {
          snowflake: snowflake,
        },
      });
    },
  };
};
