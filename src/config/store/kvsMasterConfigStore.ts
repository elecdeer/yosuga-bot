import { KvsStoreBase } from "./kvsStoreBase";

import type { AppId } from "../../types";
import type { MasterConfig, MasterConfigRecord } from "../typesConfig";
import type { StoreProps } from "./kvsStoreBase";
import type { MasterConfigStore } from "./masterConfigStore";

export class KvsMasterConfigStore
  extends KvsStoreBase<MasterConfigRecord>
  implements MasterConfigStore
{
  constructor(props: StoreProps) {
    super(props, 1);
  }

  async read(appId: AppId): Promise<Readonly<Partial<MasterConfig>>> {
    return (await this.get(appId)) ?? {};
  }

  async save(appId: AppId, value: Partial<MasterConfig>): Promise<Readonly<Partial<MasterConfig>>> {
    return (await this.set(appId, value)) ?? {};
  }
}
