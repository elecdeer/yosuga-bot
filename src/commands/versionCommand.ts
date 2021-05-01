import log4js from "log4js";
import { createEmbedBase } from "../util";
import { Command } from "../types";
import { exec } from "child_process";

const commandLogger = log4js.getLogger("command");
export const versionCommand: Command = {
  trigger: ["v", "version"],
  description: "Yosugaのバージョン情報を表示",
  usage: "",

  execute: async (args, { session, config, guild, user, textChannel }) => {
    commandLogger.debug("handleVersion");

    const result = await execPromise("cat /etc/hostname").catch((err) => "");
    commandLogger.debug(`result: ${result}`);

    return createEmbedBase().setDescription(`version: ${result}`);
  },
};

const execPromise = (cmd: string) =>
  new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      }
      resolve(stdout);
    });
  });
