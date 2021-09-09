import { Snowflake } from "discord.js";

import { MasterConfig, MasterConfigRecord } from "./configManager";
import { KvsStoreBase, StoreProps } from "./kvsStoreBase";
import { MasterConfigStore } from "./masterConfigStore";

export class KvsMasterConfigStore
  extends KvsStoreBase<MasterConfigRecord>
  implements MasterConfigStore
{
  constructor(props: StoreProps) {
    super(props, 1);
  }

  async read(appId: Snowflake): Promise<Readonly<MasterConfig>> {
    return this.get(appId);
  }

  async save(appId: Snowflake, value: Partial<MasterConfig>): Promise<Readonly<MasterConfig>> {
    await this.set(appId, value);
    return this.read(appId);
  }

  protected defaultValue(): MasterConfig {
    return {
      speakerBuildOptions: {},

      commandPrefix: "yosuga",
      ignorePrefix: "!!",
      masterVolume: 1,
      masterSpeed: 1.1,
      fastSpeedScale: 1.5,
      readStatusUpdate: true,
      readTimeSignal: false,
      timeToAutoLeaveSec: 10,
      timeToReadMemberNameSec: 30,
      maxStringLength: 80,

      speakerOption: {
        speakerName: "null",
        voiceParam: {
          pitch: 1,
          intonation: 1,
        },
      },
    };
  }
}
