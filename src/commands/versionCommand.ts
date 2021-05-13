import log4js from "log4js";
import { createEmbedBase } from "../util";
import { CommandContext } from "../types";
import { exec } from "child_process";
import { CommandBase } from "./commandBase";
import { MessageEmbed } from "discord.js";

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

    const result = await execPromise("cat /etc/hostname").catch((err) => "");
    commandLogger.debug(`result: ${result}`);

    return createEmbedBase().setDescription(`version: ${result}`);
  }
}

const execPromise = (cmd: string): Promise<string> =>
  new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      }
      resolve(stdout);
    });
  });
