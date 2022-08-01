import type {
  UserConfig as RawUserConfig,
  Voice as RawVoice,
  GuildConfig as RawGuildConfig,
  VoicevoxVoice as RawVoiceVoxVoice,
  VoiceroidDaemonVoice as RawVoiceroidDaemonVoice,
} from "@prisma/client";

export type UserConfig = RawUserConfig;
export type GuildConfig = RawGuildConfig;
export type VoicevoxVoice = RawVoiceVoxVoice;
export type VoiceroidDaemonVoice = RawVoiceroidDaemonVoice;
export type Voice = RawVoice &
  (
    | {
        type: "VOICEVOX";
        VoicevoxVoice: Omit<VoicevoxVoice, "id" | "voiceId">;
      }
    | {
        type: "VOICEROID_DAEMON";
        VoiceroidDaemonVoice: Omit<VoiceroidDaemonVoice, "id" | "voiceId">;
      }
  );

interface IRepository {
  /**
   * Userレベルの設定
   * id: UserId | GuildId | AppId
   */
  userLevel: CURD<string, Omit<UserConfig, "id">, UserConfig & { voice: Voice }>;

  /**
   * Guildレベルの設定
   * id: GuildId | AppId
   */
  guildLevel: CURD<string, Omit<GuildConfig, "id">, GuildConfig>;

  /**
   * Voice設定
   * id: VoiceId
   */
  voice: CURD<number, Omit<Voice, "id">, Voice>;

  unified: Pick<
    CURD<
      {
        userId: string;
        guildId: string;
        appId: string;
      },
      unknown,
      Required<UserConfig & { voice: Voice } & GuildConfig>
    >,
    "read"
  >;
}

type CURD<TId, TWrite, TRead = TWrite> = {
  create: (value: TWrite) => Promise<TWrite>;
  read: (id: TId) => Promise<TRead>;
  update: (id: TId, value: TWrite) => Promise<TWrite>;
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
