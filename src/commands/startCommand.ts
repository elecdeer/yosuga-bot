import log4js from "log4js";
import { createEmbedBase } from "../util";
import { CommandContext, VoiceOrStageChannel } from "../types";
import { CommandBase } from "./commandBase";
import { MessageEmbed } from "discord.js";
import {
  DiscordGatewayAdapterCreator,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { yosuga } from "../index";

const commandLogger = log4js.getLogger("command");

export class StartCommand extends CommandBase {
  constructor() {
    super({
      name: "start",
      alias: ["s"],
      description: "ボイスチャンネルに接続し,テキストチャンネルの読み上げを開始する.",
    });
  }

  async execute(args: string[], context: CommandContext): Promise<MessageEmbed> {
    const { session, textChannel, guild, user } = context;
    commandLogger.info(`try connect: ${textChannel.name}@${guild.name} `);
    if (context.type === "interaction") {
      await context.interaction.deferReply();
      // await context.interaction.defer();
    }

    const voiceChannel = user.voice.channel;
    if (voiceChannel) {
      if (session) {
        //既に接続済み
        if (session.getTextChannel().id === textChannel.id) {
          //同じテキストルーム
          return createEmbedBase().setDescription("接続済みです");
        } else {
          //別テキストルーム

          const embed = createEmbedBase().setDescription(
            `読み上げチャンネルが${textChannel.name}に変更されました`
          );
          await session.getTextChannel().send({ embeds: [embed] });

          session.changeTextChannel(textChannel);
          return createEmbedBase().setDescription(`接続しました!`);
        }
      } else {
        try {
          const sessionManager = yosuga.sessionManager;

          const connection = await connectToChannel(voiceChannel);
          sessionManager.startSession(connection, textChannel, voiceChannel);
          return createEmbedBase().setDescription("接続しました！");
        } catch (error) {
          return createEmbedBase().setDescription("接続エラーが発生しました.");
        }
      }
    } else {
      return createEmbedBase().setDescription("先にボイスチャンネルに入る必要があります.");
    }
  }
}

const connectToChannel = async (voiceChannel: VoiceOrStageChannel) => {
  //一時的なやつ
  //https://github.com/discordjs/voice/issues/166
  const adapter = voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator;

  const connection = joinVoiceChannel({
    guildId: voiceChannel.guild.id,
    channelId: voiceChannel.id,
    adapterCreator: adapter,
    selfMute: false,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30 * 1000);
    return connection;
  } catch (error) {
    connection.destroy();
    throw error;
  }
};
