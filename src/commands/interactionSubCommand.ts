import { ApplicationCommandSubCommandData, CommandInteractionOptionResolver } from "discord.js";
import { ValueOf } from "type-fest";

import { GuildConfig, MasterConfig, UserConfig } from "../configManager";

export type MasterLevelSubCommand<T extends keyof ValueOf<MasterConfig>> = {
  data: ApplicationCommandSubCommandData;
  configKey: T;
  setValue: (
    options: CommandInteractionOptionResolver,
    oldValue: ValueOf<MasterConfig>[T]
  ) => ValueOf<MasterConfig>[T];
};

export type GuildLevelSubCommand<T extends keyof ValueOf<GuildConfig>> = {
  data: ApplicationCommandSubCommandData;
  configKey: T;
  setValue: (
    options: CommandInteractionOptionResolver,
    oldValue: ValueOf<GuildConfig>[T] | undefined
  ) => ValueOf<GuildConfig>[T] | undefined;
};

export type UserLevelSubCommand<T extends keyof NonNullable<ValueOf<UserConfig>>> = {
  data: ApplicationCommandSubCommandData;
  configKey: T;
  setValue: (
    options: CommandInteractionOptionResolver,
    oldValue: ValueOf<UserConfig>[T] | undefined
  ) => ValueOf<UserConfig>[T] | undefined;
};
