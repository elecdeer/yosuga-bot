import type { GuildConfig, IRepository } from "../interaface";
import type { PrismaClient } from "@prisma/client";

export const createGuildConfigAccessor = (client: PrismaClient): IRepository["guildLevel"] => {
  return {
    create: async (value: GuildConfig) => {
      const res = await client.guildConfig.create({
        data: value,
      });
      return res.snowflake;
    },
    read: async (snowflake: string) => {
      return await client.guildConfig.findFirst({
        where: {
          snowflake: snowflake,
        },
      });
    },
    update: async (snowflake: string, value: GuildConfig) => {
      return await client.guildConfig.update({
        where: {
          snowflake: snowflake,
        },
        data: value,
      });
    },
    upsert: async (snowflake: string, value: GuildConfig) => {
      return await client.guildConfig.upsert({
        where: {
          snowflake: snowflake,
        },
        update: value,
        create: value,
      });
    },
    delete: async (snowflake: string) => {
      await client.guildConfig.delete({
        where: {
          snowflake: snowflake,
        },
      });
    },
  };
};
