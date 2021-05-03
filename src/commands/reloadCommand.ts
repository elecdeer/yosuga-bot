import log4js from "log4js";
import { createEmbedBase } from "../util";
import { Command } from "../types";
import { reloadConfigData } from "../configManager";

const commandLogger = log4js.getLogger("command");
export const reloadCommand: Command = {
  trigger: ["reload"],
  description: "Yosugaの設定ファイルをリロード",
  usage: "",

  execute: async (args, { session, config, guild, user, textChannel }) => {
    commandLogger.debug("reload config");
    const errEmbed = await reloadConfigData().catch((err) => {
      commandLogger.warn(err);
      return createEmbedBase().setDescription(`設定ファイルの読み込みに失敗しました.`);
    });

    return errEmbed || createEmbedBase().setDescription(`リロードしました.`);
  },
};
