import { ApplicationCommandOptionData, ChatInputApplicationCommandData } from "discord.js";

import { YosugaClient } from "../../yosugaClient";
import { isCommandCall } from "../filter/commandFilter";
import { CommandHandler } from "./commandHandler";
import { SubCommandHandler } from "./subCommandHandler";

export abstract class GroupCommandHandler extends CommandHandler {
  protected readonly subCommands: SubCommandHandler[];

  public constructor(yosuga: YosugaClient, subCommands: SubCommandHandler[]) {
    super(yosuga);
    this.subCommands = subCommands;
    subCommands.forEach((sub) => {
      sub.connectGroupCommand(this);
    });
  }

  protected override constructInteractionData(): ChatInputApplicationCommandData {
    const options: ApplicationCommandOptionData[] = this.subCommands.map((sub) => {
      return {
        type: "SUB_COMMAND",
        name: sub.commandProps.name,
        description: sub.commandProps.description,
        options: sub.commandProps.options,
      };
    });

    return {
      ...super.constructInteractionData(),
      options: options,
    };
  }

  public getGroupFilter() {
    return isCommandCall(this);
  }
}
