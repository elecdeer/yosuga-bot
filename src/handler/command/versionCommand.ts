import { CommandPermission } from "../../application/permissionUtil";
import { CommandContext } from "../../commandContext";
import { imageEnv } from "../../environment";
import { YosugaClient } from "../../yosugaClient";
import { CommandHandler, CommandProps } from "../base/commandHandler";

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
    await context.reply("plain", `rev: ${revision}`);
  }
}
