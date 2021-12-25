import { Collection } from "discord.js";
import { ReadonlyDeep, SetOptional } from "type-fest";

import { Speaker } from "../../speaker/speaker";
import { AppId, GuildId, UserId } from "../../util/types";
import { UnifiedConfig } from "../configManager";
import { GuildConfigStore } from "../store/guildConfigStore";
import { MasterConfigStore } from "../store/masterConfigStore";
import { UserConfigStore } from "../store/userConfigStore";
import { GuildConfigAccessorProps } from "./guildConfigAccessor";
import { MasterConfigAccessorProps } from "./masterConfigAccessor";
import { ReadOnlyConfigAccessor } from "./readOnlyConfigAccessor";
import { UserConfigAccessorProps } from "./userConfigAccessor";

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
  private readonly appId: AppId;
  private readonly guildId?: GuildId;
  private readonly userId?: UserId;
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
