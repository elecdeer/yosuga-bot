import { Command, commandLogger, createEmbedBase } from "./commands";
import { TextChannel } from "discord.js";
import { Session } from "../session";

export const startCommand: Command = {
  trigger: ["s", "start"],
  description: "ボイスチャンネルに接続し,テキストチャンネルの読み上げを開始する.",
  usage: "",

  execute: async (args, message, session, config) => {
    commandLogger.info(`try connect: ${message.guild?.id}`);
    if (!message.member) return;
    if (!message.guild) return;

    const channel = message.channel;
    if (!(channel instanceof TextChannel)) return;

    const voiceChannel = message.member.voice.channel;
    if (voiceChannel) {
      if (session) {
        //既に接続済み
        if (session.getTextChannel().id === channel.id) {
          //同じテキストルーム
          const embed = createEmbedBase().setDescription("接続済みです");
          await channel.send(embed);

          return;
        } else {
          //別テキストルーム
          await session
            .getTextChannel()
            .send(
              createEmbedBase().setDescription(
                `読み上げチャンネルが${channel.name}に変更されました`
              )
            );

          session.changeTextChannel(channel);
          await channel.send(createEmbedBase().setDescription(`接続しました!`));

          return;
        }
      } else {
        const connection = await voiceChannel.join();
        const session = new Session(voiceChannel, channel, message.guild);
        // await session.connectVoiceChannel();

        const embed = createEmbedBase().setDescription("接続しました！");

        await channel.send(embed);
      }
    } else {
      const embed = createEmbedBase().setDescription("先にボイスチャンネルに入る必要があります.");

      await message.reply(embed);
    }
  },
};
