import { CommandContext } from "../../commandContext";
import { imageEnv } from "../../environment";
import { YosugaClient } from "../../yosugaClient";
import { CommandHandler, CommandProps } from "../base/commandHandler";

export class VersionCommand extends CommandHandler {
  public constructor(yosuga: YosugaClient) {
    super(yosuga);
  }

  protected commandProps(): CommandProps {
    return {
      name: "version",
      description: "Yosugaのバージョン情報を表示する.",
    };
  }

  async execute(context: CommandContext): Promise<void> {
    const revision = imageEnv.commitId;
    await context.reply("plain", `rev: ${revision}`);
  }
}
