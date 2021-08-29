import log4js from "log4js";
import { CommandBase } from "./commandBase";
import { CommandContext } from "../commandContext";
import { yosuga } from "../index";
import { CommandPermission } from "../permissionUtil";

const commandLogger = log4js.getLogger("command");

export class DeployResetCommand extends CommandBase {
  constructor() {
    super({
      name: "deployReset",
      description: "アプリケーションコマンドをGuildに登録する.",
      permission: CommandPermission.AppOwner,
      messageCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("deployReset");
    try {
      await yosuga.commandManager.unregisterSlashCommands(context.guild.id);
      await context.reply("plain", "削除しました.");
    } catch (e) {
      await context.reply("error", "削除に失敗しました");
    }
  }
}
