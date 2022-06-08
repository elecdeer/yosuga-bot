import { ApplicationCommandSubCommandData, CommandInteraction } from "discord.js";

import { CommandPermission } from "../../application/permission";
import { YosugaClient } from "../../yosugaClient";
import { composeFilter, EventFilter, filterer } from "../filter/eventFilter";
import { CommandHandler } from "./commandHandler";
import { GroupCommandHandler } from "./groupCommandHandler";
import { EventKeysUnion } from "./handler";

export type SubCommandProps = Omit<ApplicationCommandSubCommandData, "type"> & {
  permission: CommandPermission;
};

export abstract class SubCommandHandler extends CommandHandler<SubCommandProps> {
  private groupCommand: GroupCommandHandler | null = null;

  public constructor(yosuga: YosugaClient) {
    super(yosuga);
  }

  public connectGroupCommand(groupCommand: GroupCommandHandler) {
    this.groupCommand = groupCommand;
  }

  protected override filter(
    eventName: EventKeysUnion<["interactionCreate"]>
  ): EventFilter<EventKeysUnion<["interactionCreate"]>> {
    return composeFilter(
      this.groupCommand!.getGroupFilter(),
      filterer<"interactionCreate">((interaction) => {
        const commandInteraction = interaction as CommandInteraction;
        const subCommandName = commandInteraction.options.getSubcommand(true);

        return subCommandName === this.commandProps.name;
      })
    );
  }
}
