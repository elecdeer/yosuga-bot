import { registerHandlersFromCommandTree } from "../commandHandler";
import { testCommandEvent, testCommandProps } from "./testCommand";

import type { IEventFlowHandler } from "../../eventFlow/eventFlow";
import type { YosugaEventParam } from "../../yosuga";
import type { HandlerRegister } from "../index";
import type { SharedSlashCommandOptions } from "@discordjs/builders";
import type { ChatInputCommandInteraction } from "discord.js";

type Permission = "USER" | "ADMIN" | "OWNER";

export type CommandProps = {
  name: string;
  description: string;
  permission: Permission;
};

export type CommandEvent = {
  registerEvent: (
    eventFlow: IEventFlowHandler<
      YosugaEventParam<{
        interaction: ChatInputCommandInteraction;
      }>
    >
  ) => void;
  slashOption: (builder: SharedSlashCommandOptions<false>) => void;
};

export type CommandTree = {
  props: CommandProps;
  event?: CommandEvent;
  sub?: {
    props: CommandProps;
    event?: CommandEvent;
    sub?: {
      props: CommandProps;
      event: CommandEvent;
    }[];
  }[];
}[];

export const commandTree: CommandTree = [
  {
    props: testCommandProps,
    event: testCommandEvent,
  },
];

export const registerCommandHandlers: HandlerRegister = (yosuga) => {
  registerHandlersFromCommandTree(yosuga.events.interactionCreate, commandTree);
};
