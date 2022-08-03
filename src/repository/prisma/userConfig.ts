import { parseVoiceNullable } from "../voiceParamSchema";

import type { IRepository, UserConfig } from "../interaface";
import type { PrismaClient } from "@prisma/client";

export const createUserConfigAccessor = (client: PrismaClient): IRepository["userLevel"] => {
  return {
    create: async (value: UserConfig) => {
      const res = await client.userConfig.create({
        data: value,
      });
      return res.snowflake;
    },
    read: async (snowflake: string) => {
      const rawData = await client.userConfig.findFirst({
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
    update: async (snowflake: string, value: UserConfig) => {
      return await client.userConfig.update({
        where: {
          snowflake: snowflake,
        },
        data: value,
      });
    },
    upsert: async (snowflake: string, value: UserConfig) => {
      return await client.userConfig.upsert({
        where: {
          snowflake: snowflake,
        },
        update: value,
        create: value,
      });
    },
    delete: async (snowflake: string) => {
      await client.userConfig.delete({
        where: {
          snowflake: snowflake,
        },
      });
    },
  };
};
