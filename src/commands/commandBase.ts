import { ApplicationCommandData, ApplicationCommandOptionData } from "discord.js";
import { CommandContext } from "../commandContext";
import { RequireAtLeastOne } from "type-fest";

export const CommandPermission = {
  Everyone: 0,
  GuildAdmin: 5,
  AppOwner: 100,
} as const;

type CommandPermission = typeof CommandPermission[keyof typeof CommandPermission];

export type CommandData = RequireAtLeastOne<
  {
    name: string;
    description: string;
    permission: CommandPermission;
    messageCommand?: MessageCommandOption;
    interactionCommand?: InteractionCommandOption;
  },
  "messageCommand" | "interactionCommand"
>;

type MessageCommandOption = {
  alias?: string[];
};

type InteractionCommandOption = {
  commandOptions?: ApplicationCommandOptionData[];
};

export abstract class CommandBase {
  readonly data: Readonly<CommandData>;

  protected constructor(data: CommandData) {
    this.data = data;

    if (data.messageCommand) {
      //
    }

    if (data.interactionCommand) {
      //
    }
  }

  isMessageCommand(): boolean {
    return !!this.data.messageCommand;
  }

  isInteractionCommand(): boolean {
    return !!this.data.interactionCommand;
  }

  abstract execute(context: CommandContext): Promise<void>;

  getTriggers(): string[] {
    if (this.isMessageCommand()) {
      return [this.data.name, ...(this.data.messageCommand?.alias ?? [])];
    }
    return [];
  }

  constructInteractionData(): ApplicationCommandData {
    return {
      name: this.data.name,
      description: this.data.description,
      type: "CHAT_INPUT",
      options: this.data.interactionCommand?.commandOptions,
      defaultPermission: this.data.permission <= CommandPermission.Everyone,
    };
  }
}
