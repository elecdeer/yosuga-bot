import { parseVoice, parseVoiceNullable } from "../voiceParamSchema";

import type { IRepository, Voice } from "../interaface";
import type { Prisma, PrismaClient } from "@prisma/client";

export const createVoiceAccessor = (client: PrismaClient): IRepository["voice"] => {
  return {
    create: async (value: Omit<Voice, "id">) => {
      const res = await client.voice.create({
        data: {
          ...value,
          params: JSON.stringify(value.params),
        },
      });
      return res.id;
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
    delete: async (id: number) => {
      await client.voice.delete({
        where: {
          id: id,
        },
      });
    },
    findMany: async (query: Prisma.VoiceWhereInput) => {
      const rawVoices = await client.voice.findMany({
        where: query,
      });
      return rawVoices.map(parseVoice);
    },
  };
};
