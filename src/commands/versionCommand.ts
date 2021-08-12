import log4js from "log4js";
import { createEmbedBase } from "../util";
import { CommandContext } from "../types";
import { CommandBase } from "./commandBase";
import { MessageEmbed } from "discord.js";
import { imageEnv } from "../environment";

const commandLogger = log4js.getLogger("command");

export class VersionCommand extends CommandBase {
  constructor() {
    super({
      name: "version",
      alias: ["v"],
      description: "Yosugaのバージョン情報を表示する.",
    });
  }

  async execute(args: string[], context: CommandContext): Promise<MessageEmbed> {
    commandLogger.debug("handleVersion");

    const revision = imageEnv.commitId;
    commandLogger.debug(`version: ${revision}`);

    return createEmbedBase().setDescription(`rev: ${revision}`);
  }
}
