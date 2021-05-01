import log4js from "log4js";
import { createEmbedBase } from "../util";
import { Command } from "../types";

const commandLogger = log4js.getLogger("command");
export const endCommand: Command = {
  trigger: ["e", "end"],
  description: "ボイスチャンネルから退出し,読み上げを終了する.",
  usage: "",

  execute: async (args, { session, config, guild, user, textChannel }) => {
    if (!session?.connection) return createEmbedBase().setDescription("未接続です.");

    session.disconnect();

    return createEmbedBase().setDescription("退出しました.");
  },
};
