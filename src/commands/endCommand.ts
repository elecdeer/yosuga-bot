import { Command, createEmbedBase } from "./commands";

export const endCommand: Command = {
  trigger: ["e", "end"],
  description: "ボイスチャンネルから退出し,読み上げを終了する.",
  usage: "",

  execute: async (args, message, session, config) => {
    if (!session?.connection) return;
    if (!message.guild) return;

    session.disconnect();

    const embed = createEmbedBase().setDescription("退出しました.");

    await message.channel.send(embed);
  },
};
