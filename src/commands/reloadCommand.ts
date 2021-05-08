import log4js from "log4js";
import { createEmbedBase } from "../util";
import { CommandContext } from "../types";
import { reloadConfigData } from "../configManager";
import { CommandBase } from "./commandBase";
import { MessageEmbed } from "discord.js";
import { commandList } from "../globalHandler/command";

const commandLogger = log4js.getLogger("command");

export class ReloadCommand extends CommandBase {
  constructor() {
    super({
      name: "reload",
      description: "Yosugaの設定ファイルをリロード",
    });
  }

  async execute(args: string[], { guild }: CommandContext): Promise<MessageEmbed> {
    commandLogger.debug("reload config");

    await Promise.all(
      Array.from(commandList).map((command) => guild.commands.create(command.data))
    );

    const errEmbed = await reloadConfigData().catch((err) => {
      commandLogger.warn(err);
      return createEmbedBase().setDescription(`設定ファイルの読み込みに失敗しました.`);
    });

    return errEmbed || createEmbedBase().setDescription(`リロードしました.`);
  }
}
