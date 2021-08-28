import log4js from "log4js";
import { CommandBase, CommandPermission } from "./commandBase";
import { CommandContext } from "../commandContext";
import { yosuga } from "../index";

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
      await yosuga.commandManager.registerSlashCommands(context.guild.id);
      await context.reply("plain", "登録しました.");
    } catch (e) {
      await context.reply("error", "登録に失敗しました");
    }
  }
}
