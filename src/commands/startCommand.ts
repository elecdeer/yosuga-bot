import log4js from "log4js";
import { VoiceOrStageChannel } from "../types";
import { CommandBase, CommandPermission } from "./commandBase";
import { entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { yosuga } from "../index";
import { CommandContext } from "../commandContext";

const commandLogger = log4js.getLogger("command");

export class StartCommand extends CommandBase {
  constructor() {
    super({
      name: "start",
      description: "ボイスチャンネルに接続し,テキストチャンネルの読み上げを開始する.",
      permission: CommandPermission.Everyone,
      messageCommand: {
        alias: ["s"],
      },
      interactionCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    const { session, textChannel, guild, member } = context;

    commandLogger.info(`try connect: ${textChannel.name}@${guild.name} `);

    const voiceChannel = member.voice.channel;
    if (voiceChannel) {
      if (session) {
        //既に接続済み
        if (session.getTextChannel().id === textChannel.id) {
          //同じテキストルーム
          await context.reply("warn", "接続済みです");
        } else {
          //別テキストルーム

          //TODO 確認処理
          await context.reply(
            "plain",
            `読み上げチャンネルが${textChannel.name}に変更されました`,
            session.getTextChannel()
          );

          session.changeTextChannel(textChannel);

          await context.reply("plain", `接続しました!`);
        }
      } else {
        try {
          const sessionManager = yosuga.sessionManager;

          const connection = await connectToChannel(voiceChannel);
          sessionManager.startSession(connection, textChannel, voiceChannel);
          await context.reply("plain", `接続しました!`);
        } catch (error) {
          await context.reply("error", "接続エラーが発生しました.");
        }
      }
    } else {
      await context.reply("warn", "先にボイスチャンネルに入る必要があります.");
    }
  }
}

const connectToChannel = async (voiceChannel: VoiceOrStageChannel) => {
  const connection = joinVoiceChannel({
    guildId: voiceChannel.guild.id,
    channelId: voiceChannel.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    selfMute: false,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30 * 1000);
    return connection;
  } catch (error) {
    connection.destroy();
    commandLogger.error(error);
    throw error;
  }
};
