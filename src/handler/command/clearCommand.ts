import { CommandPermission } from "../../application/permission";
import { CommandContext } from "../../commandContext";
import { YosugaClient } from "../../yosugaClient";
import { CommandHandler, CommandProps } from "../base/commandHandler";

export class ClearCommand extends CommandHandler {
  constructor(yosuga: YosugaClient) {
    super(yosuga);
  }

  protected initCommandProps(): CommandProps {
    return {
      name: "clear",
      description: "読み上げを強制的に停止し,キューをクリアする.",
      permission: CommandPermission.Everyone,
    };
  }

  async execute(context: CommandContext): Promise<void> {
    if (!context.session?.connection) {
      await context.reply("warn", "未接続です.");
      return;
    }

    context.session.player.stop();
    context.session.initializeQueue();

    await context.reply("plain", "読み上げキューをクリアしました.");
  }
}