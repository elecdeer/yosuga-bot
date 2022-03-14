import { CommandContext } from "../../commandContext";
import { CommandPermission } from "../../permissionUtil";
import { YosugaClient } from "../../yosugaClient";
import { CommandHandler, CommandProps } from "../base/commandHandler";

export class EndCommand extends CommandHandler {
  constructor(yosuga: YosugaClient) {
    super(yosuga);
  }

  protected initCommandProps(): CommandProps {
    return {
      name: "end",
      description: "ボイスチャンネルから退出し,読み上げを終了する.",
      permission: CommandPermission.Everyone,
    };
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
