import log4js from "log4js";

import { CommandContext } from "../commandContext";
import { yosuga } from "../index";
import { CommandPermission } from "../permissionUtil";
import { CommandBase } from "./commandBase";

const commandLogger = log4js.getLogger("command");

export class DeployGlobalCommand extends CommandBase {
  constructor() {
    super({
      name: "deploy-global",
      description: "アプリケーションコマンドをDiscordに登録する.",
      permission: CommandPermission.AppOwner,
      messageCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("deploy-global");
    try {
      await yosuga.commandManager.registerSlashCommands();
      await context.reply("plain", "登録しました.");
    } catch (e) {
      commandLogger.error(e);
      await context.reply("error", "登録に失敗しました");
    }
  }
}
