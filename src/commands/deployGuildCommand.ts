import log4js from "log4js";

import { CommandContext } from "../commandContext";
import { yosuga } from "../index";
import { CommandPermission } from "../permissionUtil";
import { CommandBase } from "./commandBase";

const commandLogger = log4js.getLogger("command");

export class DeployGuildCommand extends CommandBase {
  constructor() {
    super({
      name: "deployGuild",
      description: "アプリケーションコマンドをGuildに登録する.",
      permission: CommandPermission.GuildAdmin,
      messageCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("deployGuild");
    try {
      await yosuga.commandManager.registerSlashCommands(context.guild);
      await context.reply("plain", "登録しました.");
    } catch (e) {
      commandLogger.error(e);
      await context.reply("error", "登録に失敗しました");
    }
  }
}
