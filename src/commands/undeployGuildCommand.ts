import log4js from "log4js";

import { CommandPermission } from "../application/permissionUtil";
import { CommandContext } from "../commandContext";
import { CommandBase } from "./commandBase";

const commandLogger = log4js.getLogger("command");

export class UndeployGuildCommand extends CommandBase {
  constructor() {
    super({
      name: "undeploy-guild",
      description: "Guild上のアプリケーションコマンドを削除する.",
      permission: CommandPermission.GuildAdmin,
      messageCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("undeploy-guild");
    try {
      await context.yosuga.commandManager.unregisterGuildSlashCommands(context.guild.id);
      await context.reply("plain", "削除しました.");
    } catch (e) {
      await context.reply("error", "削除に失敗しました");
    }
  }
}
