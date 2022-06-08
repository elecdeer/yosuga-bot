import { CommandPermission } from "../../application/permission";
import { CommandHandler } from "../base/commandHandler";

import type { CommandContext } from "../../commandContext";
import type { YosugaClient } from "../../yosugaClient";
import type { CommandProps } from "../base/commandHandler";

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
    if (!context.session?.voiceConnection) {
      await context.reply({
        type: "warn",
        content: "未接続です.",
      });
      return;
    }

    context.session.player.stop();
    context.session.initializeQueue();

    await context.reply({
      content: "読み上げキューをクリアしました.",
    });
  }
}
