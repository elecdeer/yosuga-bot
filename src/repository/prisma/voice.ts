import { parseVoice, parseVoiceNullable } from "../voiceParamSchema";

import type { IRepository, Voice } from "../interaface";
import type { PrismaClient } from "@prisma/client";

export const createVoiceAccessor = (client: PrismaClient): IRepository["voice"] => {
  return {
    create: async (value: Omit<Voice, "id">) => {
      const res = await client.voice.create({
        data: {
          ...value,
          params: JSON.stringify(value.params),
        },
      });
      return parseVoice(res);
    },
    read: async (id: number) => {
      const rawVoice = await client.voice.findFirst({
        where: {
          id: id,
        },
      });
      return parseVoiceNullable(rawVoice);
    },
    update: async (id: number, value: Omit<Voice, "id">) => {
      const rawVoice = await client.voice.update({
        where: {
          id: id,
        },
        data: {
          ...value,
          params: JSON.stringify(value.params),
        },
      });

      return parseVoice(rawVoice);
    },
    upsert: async (id: number, value: Omit<Voice, "id">) => {
      const param = {
        ...value,
        params: JSON.stringify(value.params),
      };

      const rawVoice = await client.voice.upsert({
        where: {
          id: id,
        },
        update: param,
        create: param,
      });
      return parseVoice(rawVoice);
    },
    delete: async (id: number) => {
      await client.voice.delete({
        where: {
          id: id,
        },
      });
    },
    findMany: async (query: {
      type?: Voice["type"];
      active?: Voice["active"];
      name?: Voice["name"];
    }) => {
      const rawVoices = await client.voice.findMany({
        where: query,
      });
      return rawVoices.map(parseVoice);
    },
  };
};
