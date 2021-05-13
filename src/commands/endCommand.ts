import log4js from "log4js";
import { createEmbedBase } from "../util";
import { CommandContext } from "../types";
import { CommandBase } from "./commandBase";
import { MessageEmbed } from "discord.js";

const commandLogger = log4js.getLogger("command");

export class EndCommand extends CommandBase {
  constructor() {
    super({
      name: "end",
      alias: ["e"],
      description: "ボイスチャンネルから退出し,読み上げを終了する.",
    });
  }

  async execute(args: string[], { session }: CommandContext): Promise<MessageEmbed> {
    if (!session?.connection) return createEmbedBase().setDescription("未接続です.");

    session.disconnect();

    return createEmbedBase().setDescription("退出しました.");
  }
}
