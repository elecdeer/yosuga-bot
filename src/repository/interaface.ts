import type { SetPartialIfNullable } from "../util/utilTypes";
import type { VoiceroidDaemonParamSchema, VoicevoxParamSchema } from "./voiceParamSchema";
import type {
  General as RawGeneralConfig,
  Personal as RawPersonalConfig,
  Voice as RawVoice,
} from "@prisma/client";
import type { z } from "zod";

export type PersonalConfig = RawPersonalConfig;
export type GeneralConfig = RawGeneralConfig;
export type VoicevoxParam = z.infer<typeof VoicevoxParamSchema>;
export type VoiceroidDaemonParam = z.infer<typeof VoiceroidDaemonParamSchema>;
export type Voice = Omit<RawVoice, "params"> & {
  type: (VoicevoxParam | VoiceroidDaemonParam)["type"];
  params: VoicevoxParam | VoiceroidDaemonParam;
};

export interface IRepository {
  /**
   * personalレベルの設定
   * id: UserId | GuildId | AppId
   */
  personalLevel: CURD<
    string,
    SetPartialIfNullable<PersonalConfig>,
    PersonalConfig & { voice: Voice | null },
    PersonalConfig
  >;

  /**
   * Guildレベルの設定
   * id: GuildId | AppId
   */
  generalLevel: CURD<string, SetPartialIfNullable<GeneralConfig>, GeneralConfig, GeneralConfig>;

  /**
   * Voice設定
   * id: VoiceId
   */
  voice: CURD<number, Omit<Voice, "id">, Voice, Voice> & {
    findMany: (query: {
      type?: Voice["type"];
      active?: Voice["active"];
      name?: Voice["name"];
    }) => Promise<Voice[]>;
  };
}

type CURD<TId, TWrite, TRead = TWrite, TWriteResult = TWrite> = {
  create: (value: TWrite) => Promise<TWriteResult>;
  read: (id: TId) => Promise<TRead | null>;
  update: (id: TId, value: TWrite) => Promise<TWriteResult>;
  upsert: (id: TId, value: TWrite) => Promise<TWriteResult>;
  delete: (id: TId) => Promise<void>;
};
//
// const prisma = new PrismaClient();
// const a = await prisma.voice.findFirst({
//   where: {
//     id: 1,
//   },
//   include: {
//     VoicevoxVoice: true,
//     VoiceroidDaemonVoice: true,
//   },
// });
