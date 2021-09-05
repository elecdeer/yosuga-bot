import log4js from "log4js";

import { CommandContext } from "../commandContext";
import { CommandPermission } from "../permissionUtil";
import { CommandBase } from "./commandBase";

const commandLogger = log4js.getLogger("command");

export class UndeployGlobalCommand extends CommandBase {
  constructor() {
    super({
      name: "undeploy-global",
      description: "Discord上のアプリケーションコマンドを削除する.",
      permission: CommandPermission.AppOwner,
      messageCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("undeploy-global");
    try {
      await context.yosuga.commandManager.unregisterGlobalSlashCommands();
      await context.reply("plain", "削除しました.");
    } catch (e) {
      await context.reply("error", "削除に失敗しました");
    }
  }
}
