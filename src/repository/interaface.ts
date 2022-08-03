import type { VoiceroidDaemonParamSchema, VoicevoxParamSchema } from "./voiceParamSchema";
import type {
  GuildConfig as RawGuildConfig,
  UserConfig as RawUserConfig,
  Voice as RawVoice,
} from "@prisma/client";
import type { z } from "zod";

export type UserConfig = RawUserConfig;
export type GuildConfig = RawGuildConfig;
export type VoicevoxParam = z.infer<typeof VoicevoxParamSchema>;
export type VoiceroidDaemonParam = z.infer<typeof VoiceroidDaemonParamSchema>;
export type Voice = Omit<RawVoice, "params"> & {
  type: (VoicevoxParam | VoiceroidDaemonParam)["type"];
  params: VoicevoxParam | VoiceroidDaemonParam;
};

export interface IRepository {
  /**
   * Userレベルの設定
   * id: UserId | GuildId | AppId
   */
  userLevel: CURD<string, UserConfig, UserConfig & { voice: Voice | null }>;

  /**
   * Guildレベルの設定
   * id: GuildId | AppId
   */
  guildLevel: CURD<string, GuildConfig, GuildConfig>;

  /**
   * Voice設定
   * id: VoiceId
   */
  voice: CURD<number, Omit<Voice, "id">, Voice> & {
    findMany: (query: {
      type?: Voice["type"];
      active?: Voice["active"];
      name?: Voice["name"];
    }) => Promise<Voice[]>;
  };
}

type CURD<TId, TWrite, TRead = TWrite> = {
  create: (value: TWrite) => Promise<TId>;
  read: (id: TId) => Promise<TRead | null>;
  update: (id: TId, value: TWrite) => Promise<TWrite>;
  upsert: (id: TId, value: TWrite) => Promise<TWrite>;
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
