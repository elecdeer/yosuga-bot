import log4js from "log4js";
import { CommandBase } from "./commandBase";
import { imageEnv } from "../environment";
import { CommandContext } from "../commandContext";
import { CommandPermission } from "../permissionUtil";

const commandLogger = log4js.getLogger("command");

export class VersionCommand extends CommandBase {
  constructor() {
    super({
      name: "version",
      description: "Yosugaのバージョン情報を表示する.",
      permission: CommandPermission.GuildAdmin,
      messageCommand: {},
      interactionCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("handleVersion");

    const revision = imageEnv.commitId;
    commandLogger.debug(`version: ${revision}`);

    await context.reply("plain", `rev: ${revision}`);
  }
}
