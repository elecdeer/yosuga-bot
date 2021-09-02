import log4js from "log4js";

import { CommandContext } from "../commandContext";
import { yosuga } from "../index";
import { CommandPermission } from "../permissionUtil";
import { CommandBase } from "./commandBase";

const commandLogger = log4js.getLogger("command");

export class DeployResetCommand extends CommandBase {
  constructor() {
    super({
      name: "deploy-reset",
      description: "アプリケーションコマンドをGuildに登録する.",
      permission: CommandPermission.AppOwner,
      messageCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("deploy-reset");
    try {
      await yosuga.commandManager.unregisterSlashCommands(context.guild.id);
      await context.reply("plain", "削除しました.");
    } catch (e) {
      await context.reply("error", "削除に失敗しました");
    }
  }
}
