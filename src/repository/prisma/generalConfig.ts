import type { IRepository } from "../interaface";
import type { PrismaClient } from "@prisma/client";

export const createGuildConfigAccessor = (client: PrismaClient): IRepository["generalLevel"] => {
  return {
    create: async (value) => {
      return await client.general.create({
        data: value,
      });
    },
    read: async (snowflake) => {
      return await client.general.findFirst({
        where: {
          snowflake: snowflake,
        },
      });
    },
    update: async (snowflake, value) => {
      return await client.general.update({
        where: {
          snowflake: snowflake,
        },
        data: value,
      });
    },
    upsert: async (snowflake, value) => {
      return await client.general.upsert({
        where: {
          snowflake: snowflake,
        },
        update: value,
        create: value,
      });
    },
    delete: async (snowflake: string) => {
      await client.general.delete({
        where: {
          snowflake: snowflake,
        },
      });
    },
  };
};
