import { ClientEvents, Interaction } from "discord.js";

import { Handler } from "./handler";

export abstract class CommandHandler extends Handler<"interactionCreate"> {
  protected constructor() {
    super(["interactionCreate"]);
    //コマンド構文
  }

  protected override async filter(
    eventName: "interactionCreate",
    ...args: [Interaction]
  ): Promise<boolean> {
    const [interaction] = args;

    if (!interaction.isCommand()) return false;
    if (interaction.commandName !== "!!!!commandName") return false;
    return super.filter(eventName, ...args);
  }

  protected override async onEvent(
    eventName: "interactionCreate",
    args: ClientEvents["interactionCreate"]
  ): Promise<void> {
    const [interaction] = args;

    //Sessionの取得とか
    // await this.execute(interaction);
  }

  // abstract execute(interaction: Interaction): Promise<void>;
}
