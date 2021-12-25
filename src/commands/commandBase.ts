import { ApplicationCommandData, ApplicationCommandOptionData } from "discord.js";
import { RequireAtLeastOne } from "type-fest";

import { CommandContext } from "../commandContext";
import { CommandPermission } from "../permissionUtil";

export type BasicCommandData = {
  name: string;
  description: string;
  permission: CommandPermission;
};

export type CommandData = BasicCommandData &
  RequireAtLeastOne<
    {
      messageCommand?: MessageCommandOption;
      interactionCommand?: InteractionCommandOption;
    },
    "messageCommand" | "interactionCommand"
  >;

export type MessageCommandOption = {
  alias?: string[];
};

type Resolvable<T> = T | (() => T);
export type InteractionCommandOption = {
  commandOptions?: Resolvable<ApplicationCommandOptionData[]>;
};

export abstract class CommandBase {
  readonly data: Readonly<CommandData>;

  protected constructor(data: CommandData) {
    this.data = data;
  }

  isMessageCommand(): boolean {
    return !!this.data.messageCommand;
  }

  isInteractionCommand(): boolean {
    return !!this.data.interactionCommand;
  }

  abstract execute(context: CommandContext): Promise<void>;

  getTriggers(): string[] {
    const trigger = [this.data.name];
    if (this.isMessageCommand() && this.data.messageCommand?.alias) {
      trigger.push(...this.data.messageCommand.alias);
    }
    return trigger;
  }

  constructInteractionData(): ApplicationCommandData {
    const commandOptionsData = this.data.interactionCommand?.commandOptions;
    const options =
      typeof commandOptionsData === "function" ? commandOptionsData() : commandOptionsData;

    return {
      name: this.data.name,
      description: this.data.description,
      type: "CHAT_INPUT",
      options: options,
      defaultPermission: true,
    };
  }
}
