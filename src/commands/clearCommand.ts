import log4js from "log4js";
import { createEmbedBase } from "../util";
import { Command } from "../types";

const commandLogger = log4js.getLogger("command");
export const clearCommand: Command = {
  trigger: ["c", "clear"],
  description: "読み上げを強制的に停止し,キューをクリアする.",
  usage: "",

  execute: async (args, { session, config, guild, user, textChannel }) => {
    commandLogger.debug("handleClear");

    commandLogger.debug(session);

    if (!session?.connection) return createEmbedBase().setDescription("未接続です.");

    if (session.connection.dispatcher) {
      session.connection.dispatcher.destroy();
    }
    session.initializeQueue();

    return createEmbedBase().setDescription("読み上げキューをクリアしました.");
  },
};
