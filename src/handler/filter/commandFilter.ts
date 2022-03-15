import { CommandHandler } from "../base/commandHandler";
import { FilterChecker } from "./eventFilter";

export const isCommandCall: FilterChecker<"interactionCreate", CommandHandler> = (command) => {
  return (interaction) => {
    return interaction.isCommand() && interaction.commandName === command.commandProps.name;
  };
};
