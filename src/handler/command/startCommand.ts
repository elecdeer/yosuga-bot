import { entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";

import { CommandPermission } from "../../application/permission";
import { constructEmbeds } from "../../util/createEmbed";
import { CommandHandler } from "../base/commandHandler";

import type { CommandContext } from "../../commandContext";
import type { VoiceOrStageChannel } from "../../types";
import type { YosugaClient } from "../../yosugaClient";
import type { CommandProps } from "../base/commandHandler";
import type { DiscordGatewayAdapterCreator, VoiceConnection } from "@discordjs/voice";
import type { StageChannel, TextChannel, VoiceChannel } from "discord.js";

export class StartCommand extends CommandHandler {
  constructor(yosuga: YosugaClient) {
    super(yosuga);
  }

  protected initCommandProps(): CommandProps {
    return {
      name: "start",
      description: "ボイスチャンネルに接続し,テキストチャンネルの読み上げを開始する.",
      permission: CommandPermission.Everyone,
    };
  }

  async execute(context: CommandContext): Promise<void> {
    const { session, textChannel, guild, member } = context;
    this.logger.info(`try connect: ${textChannel.name}@${guild.name} `);

    const voiceChannel = member.voice.channel;

    if (voiceChannel) {
      if (!hasBotPermission(textChannel, voiceChannel)) {
        await context.reply({
          type: "error",
          content: "チャンネルに参加する権限がBotにありません.",
        });
        return;
      }

      if (session) {
        //既に接続済み
        if (
          session.textChannel.id === textChannel.id &&
          session.voiceChannel.id === voiceChannel.id
        ) {
          //同じテキストルーム
          await context.reply({
            type: "warn",
            content: "接続済みです.",
          });
        } else {
          //別テキストルーム

          //TODO 確認処理

          const oldTextChannel = session.textChannel;

          const contents: string[] = [];
          if (session.textChannel.id !== textChannel.id) {
            contents.push(`読み上げチャンネルが${textChannel.name}に変更されました.`);

            session.changeTextChannel(textChannel);
          }
          if (session.voiceChannel.id !== voiceChannel.id) {
            contents.push(`接続チャンネルが${voiceChannel.name}に変更されました.`);

            const connection = await this.connectToChannel(voiceChannel);
            session.changeVoiceChannel(voiceChannel, connection);
          }

          await context.reply({ content: contents.join("\n"), channel: oldTextChannel });
          await context.reply({ content: `接続しました!` });
        }
      } else {
        try {
          const sessionManager = context.yosuga.sessionManager;

          const connection = await this.connectToChannel(voiceChannel);
          const session = sessionManager.startSession(connection, textChannel, voiceChannel);
          const message = await context.reply({ content: `接続しました!\nボイスの初期化中...` });

          await session.voiceProvider.getSpeakersStatus(true);
          await message.edit({
            embeds: constructEmbeds("plain", "接続しました!\nボイスの初期化完了."),
          });
        } catch (error) {
          await context.reply({
            type: "error",
            content: "接続エラーが発生しました.",
          });
        }
      }
    } else {
      await context.reply({
        type: "warn",
        content: "先にボイスチャンネルに入る必要があります.",
      });
    }
  }

  private async connectToChannel(voiceChannel: VoiceOrStageChannel): Promise<VoiceConnection> {
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
      this.logger.error(error);
      throw error;
    }
  }
}

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
