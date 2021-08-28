import log4js from "log4js";
import { CommandBase, CommandPermission } from "./commandBase";
import { ApplicationCommandOptionChoice, MessageEmbed } from "discord.js";
import { yosuga } from "../index";
import { CommandManager } from "../commandManager";
import { CommandContext } from "../commandContext";

const commandLogger = log4js.getLogger("command");

const getCommandOptions = (commandManager: CommandManager): ApplicationCommandOptionChoice[] => {
  const options = commandManager.commandCollection.map((cmd) => ({
    name: cmd.data.name,
    value: cmd.data.name,
  }));
  commandLogger.debug(`commandOptions: ${options}`);
  return options;
};

const OPTION_NAME = "filter";

export class HelpCommand extends CommandBase {
  constructor() {
    super({
      name: "help",
      description: "Yosugaのコマンド一覧を表示する.",
      permission: CommandPermission.Everyone,
      messageCommand: {},
      interactionCommand: {
        commandOptions: () => [
          {
            name: OPTION_NAME,
            type: "STRING",
            description: "フィルタ",
            choices: getCommandOptions(yosuga.commandManager),
            required: false,
          },
        ],
      },
    });
  }

  async execute(context: CommandContext): Promise<void> {
    commandLogger.debug("handle help command");

    const option = context.getOptions()?.getString(OPTION_NAME) ?? undefined;
    const commands = yosuga.commandManager.getCommandList(option);
    commandLogger.debug(option);
    commandLogger.debug(commands);

    const embed = new MessageEmbed();
    embed.setDescription(`コマンド一覧 ${option}`);
    embed.addFields(
      commands.map((command) => {
        const name = command.getTriggers().join(" | ");

        return {
          name: name,
          value: command.data.descriptio,
        };
      })
    );

    await context.reply("plain", embed);
  }
}
