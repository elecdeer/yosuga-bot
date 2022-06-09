import { CommandPermission } from "../../application/permission";
import { imageEnv } from "../../environment";
import { CommandHandler } from "../base/commandHandler";

import type { CommandContext } from "../../commandContext";
import type { YosugaClient } from "../../yosugaClient";
import type { CommandProps } from "../base/commandHandler";

export class VersionCommand extends CommandHandler {
  constructor(yosuga: YosugaClient) {
    super(yosuga);
  }

  protected initCommandProps(): CommandProps {
    return {
      name: "version",
      description: "Yosugaのバージョン情報を表示する.",
      permission: CommandPermission.GuildAdmin,
    };
  }

  async execute(context: CommandContext): Promise<void> {
    const revision = imageEnv.commitId;
    await context.reply({
      content: `rev: ${revision}`,
    });
  }
}
