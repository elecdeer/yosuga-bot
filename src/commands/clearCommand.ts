import log4js from "log4js";

import { CommandContext } from "../commandContext";
import { CommandPermission } from "../permissionUtil";
import { CommandBase } from "./commandBase";

const commandLogger = log4js.getLogger("command");

export class ClearCommand extends CommandBase {
  constructor() {
    super({
      name: "clear",
      description: "読み上げを強制的に停止し,キューをクリアする.",
      permission: CommandPermission.Everyone,
      messageCommand: {
        alias: ["c"],
      },
      interactionCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("handleClear");

    if (!context.session?.connection) {
      await context.reply("warn", "未接続です.");
      return;
    }

    context.session.player.stop();
    context.session.initializeQueue();

    await context.reply("plain", "読み上げキューをクリアしました.");
  }
}
