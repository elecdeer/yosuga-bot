import { ApplicationCommandSubCommandData } from "discord.js";

import { CommandContextSlash } from "../commandContextSlash";

export abstract class SubCommandBase {
  readonly data: Readonly<ApplicationCommandSubCommandData>;

  protected constructor(data: Omit<ApplicationCommandSubCommandData, "type">) {
    this.data = {
      ...data,
      type: "SUB_COMMAND",
    };

    //optionsをResolvableにした方がいいのかも？
  }

  abstract execute(context: CommandContextSlash): Promise<void>;
}
