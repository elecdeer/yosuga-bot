import { composeFilter, filterer } from "../filter/eventFilter";
import { CommandHandler } from "./commandHandler";

import type { CommandPermission } from "../../application/permission";
import type { YosugaClient } from "../../yosugaClient";
import type { EventFilter } from "../filter/eventFilter";
import type { GroupCommandHandler } from "./groupCommandHandler";
import type { EventKeysUnion } from "./handler";
import type { ApplicationCommandSubCommandData, CommandInteraction } from "discord.js";

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
