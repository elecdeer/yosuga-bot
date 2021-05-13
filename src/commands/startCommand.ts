import log4js from "log4js";
import { createEmbedBase } from "../util";
import { CommandContext } from "../types";
import { startSession } from "../sessionManager";
import { CommandBase } from "./commandBase";
import { MessageEmbed } from "discord.js";

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
      void context.interaction.defer();
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

          await session
            .getTextChannel()
            .send(
              createEmbedBase().setDescription(
                `読み上げチャンネルが${textChannel.name}に変更されました`
              )
            );

          session.changeTextChannel(textChannel);
          return createEmbedBase().setDescription(`接続しました!`);
        }
      } else {
        const connection = await voiceChannel.join();
        startSession(connection, textChannel);
        return createEmbedBase().setDescription("接続しました！");
      }
    } else {
      return createEmbedBase().setDescription("先にボイスチャンネルに入る必要があります.");
    }
  }
}
