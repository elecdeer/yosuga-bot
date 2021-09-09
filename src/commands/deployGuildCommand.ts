import log4js from "log4js";

import { CommandContext } from "../commandContext";
import { CommandPermission } from "../permissionUtil";
import { CommandBase } from "./commandBase";

const commandLogger = log4js.getLogger("command");

export class DeployGuildCommand extends CommandBase {
  constructor() {
    super({
      name: "deploy-guild",
      description: "アプリケーションコマンドをGuildに登録する.",
      permission: CommandPermission.GuildAdmin,
      messageCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("deploy-guild");
    try {
      await context.yosuga.commandManager.registerSlashCommands(context.guild);
      await context.reply("plain", "正常に登録が完了しました.");
    } catch (e) {
      commandLogger.error(e);
      await context.reply("error", "登録中にエラーが発生しました.");
    }
  }
}
