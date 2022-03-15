import { ApplicationCommandSubCommandData, CommandInteraction, Interaction } from "discord.js";

import { CommandPermission } from "../../application/permission";
import { YosugaClient } from "../../yosugaClient";
import { CommandHandler } from "./commandHandler";
import { GroupCommandHandler } from "./groupCommandHandler";

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

  protected override async filter(
    eventName: "interactionCreate",
    args: [Interaction]
  ): Promise<boolean> {
    const [interaction] = args;

    if (!this.groupCommand!.getGroupFilter()(interaction)) return false;
    const commandInteraction = interaction as CommandInteraction;
    const subCommandName = commandInteraction.options.getSubcommand(true);

    return subCommandName === this.commandProps.name;
  }
}
