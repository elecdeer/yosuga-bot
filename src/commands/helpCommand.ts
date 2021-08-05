import { createEmbedBase } from "../util";
import log4js from "log4js";
import { CommandContext } from "../types";
import { CommandBase } from "./commandBase";
import { MessageEmbed } from "discord.js";
import { yosuga } from "../index";

const commandLogger = log4js.getLogger("command");

export class HelpCommand extends CommandBase {
  constructor() {
    super({
      name: "help",
      description: "Yosugaのコマンド一覧を表示する.",
      options: [
        {
          name: "command",
          type: "STRING",
          description: "フィルタ",
        },
      ],
    });
  }

  async execute(args: string[], { config }: CommandContext): Promise<MessageEmbed> {
    const commands = yosuga.commandManager.getCommandList(args);

    const embed = createEmbedBase();
    embed.setDescription("Yosugaのコマンド一覧");

    if (args.length > 0) {
      embed.setDescription(`Yosugaのコマンド一覧 (filter: ${args.join(", ")})`);
    }

    embed.addFields(
      commands.map((command) => {
        const name = command.getTriggers().join(" | ");

        return {
          name: name,
          value: `${command.data.description} \n usage: ${command.getUsage()}`,
        };
      })
    );

    return embed;
  }
}
