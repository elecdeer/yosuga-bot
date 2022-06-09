import { filterGenerator } from "./eventFilter";

import type { CommandHandler } from "../base/commandHandler";
import type { FilterCheckerGenerator } from "./eventFilter";

/**
 * イベントがコマンド呼び出しによるものかどうか
 * @param command
 */
export const isCommandCall: FilterCheckerGenerator<"interactionCreate", CommandHandler> = (
  command
) => {
  return (interaction) => {
    return interaction.isCommand() && interaction.commandName === command.commandProps.name;
  };
};

/**
 * コマンド呼び出しかどうかのフィルタ
 */
export const commandFilter = filterGenerator(isCommandCall);
