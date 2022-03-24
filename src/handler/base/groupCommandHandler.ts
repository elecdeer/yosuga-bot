import { ApplicationCommandOptionData, ChatInputApplicationCommandData, Client } from "discord.js";

import { CommandContext } from "../../commandContext";
import { YosugaClient } from "../../yosugaClient";
import { CommandHandler } from "./commandHandler";
import { EventArgs, EventKeysUnion } from "./handler";
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

  public override constructInteractionData(): ChatInputApplicationCommandData {
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

  override hookEvent(client: Client): {
    name: EventKeysUnion<["interactionCreate"]>;
    listener: (...args: EventArgs<["interactionCreate"]>) => void;
  }[] {
    const listeners = super.hookEvent(client);
    this.subCommands.forEach((sub) => {
      listeners.push(...sub.hookEvent(client));
    });

    return listeners;
  }

  public getGroupFilter() {
    return this.filter("interactionCreate");
  }

  override execute(context: CommandContext): Promise<void> {
    //何もしない
    return Promise.resolve(undefined);
  }
}
