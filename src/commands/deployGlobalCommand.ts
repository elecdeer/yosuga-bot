import log4js from "log4js";

import { CommandContext } from "../commandContext";
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
      await context.yosuga.commandManager.registerSlashCommands();
      await context.reply("plain", "正常に登録が完了しました.");
    } catch (e) {
      commandLogger.error(e);
      await context.reply("error", "登録中にエラーが発生しました.");
    }
  }
}
