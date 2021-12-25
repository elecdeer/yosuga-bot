import {
  DiscordGatewayAdapterCreator,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { StageChannel, TextChannel, VoiceChannel } from "discord.js";
import log4js from "log4js";

import { CommandContext } from "../commandContext";
import { CommandPermission } from "../permissionUtil";
import { VoiceOrStageChannel } from "../types";
import { CommandBase } from "./commandBase";

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
      if (!hasBotPermission(textChannel, voiceChannel)) {
        await context.reply("error", "チャンネルに参加する権限がBotにありません.");
        return;
      }

      if (session) {
        //既に接続済み
        if (
          session.getTextChannel().id === textChannel.id &&
          session.getVoiceChannel().id === voiceChannel.id
        ) {
          //同じテキストルーム
          await context.reply("warn", "接続済みです.");
        } else {
          //別テキストルーム

          //TODO 確認処理

          const oldTextChannel = session.getTextChannel();

          const contents: string[] = [];
          if (session.getTextChannel().id !== textChannel.id) {
            contents.push(`読み上げチャンネルが${textChannel.name}に変更されました.`);

            session.changeTextChannel(textChannel);
          }
          if (session.getVoiceChannel().id !== voiceChannel.id) {
            contents.push(`接続チャンネルが${voiceChannel.name}に変更されました.`);

            const connection = await connectToChannel(voiceChannel);
            session.changeVoiceChannel(voiceChannel, connection);
          }

          await context.reply("plain", contents.join("\n"), oldTextChannel);
          await context.reply("plain", `接続しました!`);
        }
      } else {
        try {
          const sessionManager = context.yosuga.sessionManager;

          const connection = await connectToChannel(voiceChannel);
          const session = sessionManager.startSession(connection, textChannel, voiceChannel);
          const message = await context.reply("plain", `接続しました!\nボイスの初期化中...`);

          await session.getVoiceProvider().getSpeakersStatus(true);
          await message.edit({
            embeds: [context.constructEmbed("plain", "接続しました!\nボイスの初期化完了.")],
          });
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
    adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
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

const hasBotPermission = (textChannel: TextChannel, voiceChannel: VoiceChannel | StageChannel) => {
  const me = textChannel.guild.me!;
  const tcPermission = me.permissionsIn(textChannel);
  const vcPermission = me.permissionsIn(voiceChannel);

  return (
    tcPermission.has("VIEW_CHANNEL") &&
    tcPermission.has("SEND_MESSAGES") &&
    vcPermission.has("CONNECT") &&
    vcPermission.has("SPEAK")
  );
};
