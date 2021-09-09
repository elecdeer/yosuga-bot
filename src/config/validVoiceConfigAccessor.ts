import { Collection, Snowflake } from "discord.js";
import { ReadonlyDeep, SetOptional } from "type-fest";

import { Speaker } from "../speaker/speaker";
import { SpeakerOption } from "../types";
import { UnifiedConfig } from "./configManager";
import { GuildConfigAccessorProps } from "./guildConfigAccessor";
import { GuildConfigStore } from "./guildConfigStore";
import { MasterConfigAccessorProps } from "./masterConfigAccessor";
import { MasterConfigStore } from "./masterConfigStore";
import { ReadOnlyConfigAccessor } from "./readOnlyConfigAccessor";
import { UnifiedConfigAccessorProps } from "./unifiedConfigAccessor";
import { UserConfigAccessorProps } from "./userConfigAccessor";
import { UserConfigStore } from "./userConfigStore";

export type ValidVoiceConfigAccessorProps = {
  master: MasterConfigAccessorProps;
  guild: SetOptional<GuildConfigAccessorProps, "guildId">;
  user: SetOptional<UserConfigAccessorProps, "userId">;
};

export class ValidVoiceConfigAccessor extends ReadOnlyConfigAccessor<
  Partial<Pick<UnifiedConfig, "speakerOption">>
> {
  private readonly masterStore: MasterConfigStore;
  private readonly guildStore: GuildConfigStore;
  private readonly userStore: UserConfigStore;
  private readonly appId: Snowflake;
  private readonly guildId?: Snowflake;
  private readonly userId?: Snowflake;
  private readonly speakerCollection: Collection<string, Speaker>;

  constructor(
    { master, guild, user }: ValidVoiceConfigAccessorProps,
    speakerCollection: Collection<string, Speaker>
  ) {
    super();
    this.masterStore = master.store;
    this.guildStore = guild.store;
    this.userStore = user.store;
    this.appId = master.appId;
    this.guildId = guild.guildId;
    this.userId = user.userId;

    this.speakerCollection = speakerCollection;
  }

  async get(key: "speakerOption"): Promise<Readonly<UnifiedConfig["speakerOption"] | undefined>> {
    return (await this.getAllValue())[key];
  }

  async getAllValue(): Promise<ReadonlyDeep<Partial<Pick<UnifiedConfig, "speakerOption">>>> {
    if (this.userId) {
      const userConfig = await this.userStore.read(this.userId);

      if (this.isActiveSpeaker(userConfig?.speakerOption?.speakerName)) {
        return {
          speakerOption: userConfig.speakerOption!,
        };
      }
    }

    if (this.guildId) {
      const guildConfig = await this.guildStore.read(this.guildId);
      if (this.isActiveSpeaker(guildConfig?.speakerOption?.speakerName)) {
        return {
          speakerOption: guildConfig.speakerOption!,
        };
      }
    }

    const masterConfig = await this.masterStore.read(this.appId);
    if (this.isActiveSpeaker(masterConfig.speakerOption?.speakerName)) {
      return {
        speakerOption: masterConfig.speakerOption,
      };
    }

    return {};
  }

  isActiveSpeaker(speakerName: string | undefined): boolean {
    if (!speakerName) return false;
    const speaker = this.speakerCollection.get(speakerName);
    return speaker?.status === "active";
  }
}
