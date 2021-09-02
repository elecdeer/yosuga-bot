import { ApplicationCommandSubCommandData } from "discord.js";

import { SubCommandBase } from "../subCommandBase";

export type ConfigCommandLevel = "MASTER" | "GUILD" | "USER";

export abstract class ConfigSubCommand extends SubCommandBase {
  readonly level: ConfigCommandLevel;

  protected constructor(
    data: Omit<ApplicationCommandSubCommandData, "type">,
    level: ConfigCommandLevel
  ) {
    super(data);
    this.level = level;
  }
}

export const isRequiredOption = (level: ConfigCommandLevel): boolean => {
  return false;
};
