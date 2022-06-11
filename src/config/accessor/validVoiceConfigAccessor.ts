import { getLogger } from "log4js";

import { ReadOnlyConfigAccessor } from "./readOnlyConfigAccessor";
import { UnifiedConfigAccessor } from "./unifiedConfigAccessor";

import type { Speaker } from "../../speaker/speaker";
import type { AppId, GuildId, UserId } from "../../types";
import type { GuildConfigStore } from "../store/guildConfigStore";
import type { MasterConfigStore } from "../store/masterConfigStore";
import type { UserConfigStore } from "../store/userConfigStore";
import type { UnifiedConfig, VoiceConfigKey } from "../typesConfig";
import type { GuildConfigAccessorProps } from "./guildConfigAccessor";
import type { MasterConfigAccessorProps } from "./masterConfigAccessor";
import type { UserConfigAccessorProps } from "./userConfigAccessor";
import type { Collection } from "discord.js";
import type { ReadonlyDeep, SetOptional } from "type-fest";

export type ValidVoiceConfigAccessorProps = {
  master: MasterConfigAccessorProps;
  guild: SetOptional<GuildConfigAccessorProps, "guildId">;
  user: SetOptional<UserConfigAccessorProps, "userId">;
};

export class ValidVoiceConfigAccessor extends ReadOnlyConfigAccessor<
  Pick<UnifiedConfig, VoiceConfigKey>,
  false
> {
  private readonly masterStore: MasterConfigStore;
  private readonly guildStore: GuildConfigStore;
  private readonly userStore: UserConfigStore;
  private readonly appId: AppId;
  private readonly guildId?: GuildId;
  private readonly userId?: UserId;
  private readonly unifiedConfigAccessor: UnifiedConfigAccessor;

  private readonly speakerCollection: Collection<string, Speaker>;

  constructor(
    props: ValidVoiceConfigAccessorProps,
    speakerCollection: Collection<string, Speaker>
  ) {
    super();
    const { master, guild, user } = props;
    this.masterStore = master.store;
    this.guildStore = guild.store;
    this.userStore = user.store;
    this.appId = master.appId;
    this.guildId = guild.guildId;
    this.userId = user.userId;

    this.unifiedConfigAccessor = new UnifiedConfigAccessor(props);

    this.speakerCollection = speakerCollection;
  }

  override async get<T extends keyof Pick<UnifiedConfig, VoiceConfigKey>>(
    key: T
  ): Promise<Readonly<Pick<UnifiedConfig, VoiceConfigKey>[T]>> {
    return (await this.getAllValue())[key];
  }

  override async getAllValue(): Promise<ReadonlyDeep<Pick<UnifiedConfig, VoiceConfigKey>>> {
    const unifiedConfig = await this.unifiedConfigAccessor.getAllValue();
    const logger = getLogger("validVoiceConfigAccessor");
    logger.debug(unifiedConfig);

    if (this.userId !== undefined) {
      const userConfig = await this.userStore.read(this.userId);

      if (this.isActiveSpeaker(userConfig?.speakerName)) {
        return {
          ...unifiedConfig,
          speakerName: userConfig.speakerName,
        };
      }
    }

    if (this.guildId !== undefined) {
      const guildConfig = await this.guildStore.read(this.guildId);
      if (this.isActiveSpeaker(guildConfig?.speakerName)) {
        return {
          ...unifiedConfig,
          speakerName: guildConfig.speakerName,
        };
      }
    }

    const masterConfig = await this.masterStore.read(this.appId);
    if (this.isActiveSpeaker(masterConfig?.speakerName)) {
      return {
        ...unifiedConfig,
        speakerName: masterConfig.speakerName,
      };
    }
    return {
      ...unifiedConfig,
      speakerName: "",
    };
  }

  isActiveSpeaker(speakerName: string | undefined): speakerName is string {
    if (speakerName === undefined) return false;
    const speaker = this.speakerCollection.get(speakerName);
    return speaker?.status === "active";
  }
}
