import assert from "assert";
import { Collection } from "discord.js";

import { CommandContext } from "../commandContext";
import { CommandContextSlash } from "../commandContextSlash";
import { BasicCommandData, CommandBase } from "./commandBase";
import { SubCommandBase } from "./subCommandBase";

export class CommandGroup extends CommandBase {
  protected readonly subCommands: Collection<string, SubCommandBase> = new Collection<
    string,
    SubCommandBase
  >();

  constructor(data: BasicCommandData) {
    super({
      ...data,
      interactionCommand: {
        commandOptions: () => this.subCommands.map((sub) => sub.data),
      },
    });
  }

  addSubCommand(sub: SubCommandBase): void {
    assert(!this.subCommands.has(sub.data.name));
    this.subCommands.set(sub.data.name, sub);
  }

  override execute(context: CommandContext): Promise<void> {
    const subCommandName = context.getOptions()?.getSubcommand(true);
    assert(subCommandName);

    const subCommand = this.subCommands.get(subCommandName);
    assert(subCommand);

    assert(context instanceof CommandContextSlash);

    return subCommand.execute(context);
  }
}
