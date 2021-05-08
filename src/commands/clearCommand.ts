import log4js from "log4js";
import { createEmbedBase } from "../util";
import { CommandContext } from "../types";
import { CommandBase } from "./commandBase";
import { MessageEmbed } from "discord.js";

const commandLogger = log4js.getLogger("command");

export class ClearCommand extends CommandBase {
  constructor() {
    super({
      name: "clear",
      alias: ["c"],
      description: "読み上げを強制的に停止し,キューをクリアする.",
    });
  }

  async execute(args: string[], { session }: CommandContext): Promise<MessageEmbed> {
    commandLogger.debug("handleClear");
    commandLogger.debug(session);

    if (!session?.connection) return createEmbedBase().setDescription("未接続です.");

    if (session.connection.dispatcher) {
      session.connection.dispatcher.destroy();
    }
    session.initializeQueue();

    return createEmbedBase().setDescription("読み上げキューをクリアしました.");
  }
}
