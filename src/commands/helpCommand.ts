import { commandList } from "../globalHandler/command";
import { createEmbedBase } from "../util";
import log4js from "log4js";
import { CommandContext } from "../types";
import { CommandBase } from "./commandBase";
import { MessageEmbed } from "discord.js";

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
    let commands = Array.from(commandList);

    const embed = createEmbedBase();
    embed.setDescription("Yosugaのコマンド一覧");

    if (args.length > 0) {
      embed.setDescription(`Yosugaのコマンド一覧 (filter: ${args.join(", ")})`);

      //関係あるものだけ取り出す
      commands = commands.filter(
        (command) => command.getTriggers().filter((trig) => args.indexOf(trig) !== -1).length > 0
      );
    }

    embed.addFields(
      commands.map((command) => {
        const name = command.getTriggers().join(" | ");
        const usage = `${config.commandPrefix} ${command.data.name} ${command.getUsage()}`;

        return {
          name: name,
          value: `${command.data.description} \n usage: ${command.getUsage(}`,
        };
      })
    );

    return embed;
  }
}
