import log4js from "log4js";

import { CommandContext } from "../commandContext";
import { CommandPermission } from "../permissionUtil";
import { CommandBase } from "./commandBase";

const commandLogger = log4js.getLogger("command");

export class ReloadCommand extends CommandBase {
  constructor() {
    super({
      name: "reload",
      description: "Yosugaの設定ファイルをリロード",
      permission: CommandPermission.AppOwner,
      messageCommand: {},
      interactionCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("reload config");

    // try {
    //   await reloadConfigData();
    //   await context.reply("plain", `リロードしました.`);
    // } catch (err) {
    //   commandLogger.warn(err);
    //   await context.reply("error", `設定ファイルの読み込みに失敗しました.`);
    // }
  }
}
