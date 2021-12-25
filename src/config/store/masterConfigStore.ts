import { AppId } from "../../util/types";
import { MasterConfig } from "../configManager";

export interface MasterConfigStore {
  save(appId: AppId, value: Partial<MasterConfig>): Promise<Readonly<MasterConfig>>;
  read(appId: AppId): Promise<Readonly<MasterConfig>>;
}
