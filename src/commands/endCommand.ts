import log4js from "log4js";

import { CommandPermission } from "../application/permissionUtil";
import { CommandContext } from "../commandContext";
import { CommandBase } from "./commandBase";

const commandLogger = log4js.getLogger("command");

export class EndCommand extends CommandBase {
  constructor() {
    super({
      name: "end",
      description: "ボイスチャンネルから退出し,読み上げを終了する.",
      permission: CommandPermission.Everyone,
      messageCommand: {
        alias: ["e"],
      },
      interactionCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    if (!context.session?.connection) {
      await context.reply("warn", "未接続です.");
      return;
    }

    context.session.disconnect();

    await context.reply("plain", "退出しました.");
  }
}
