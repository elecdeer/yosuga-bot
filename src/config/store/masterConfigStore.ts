import { AppId } from "../../types";
import { MasterConfig } from "../typesConfig";

export interface MasterConfigStore {
  save(appId: AppId, value: Partial<MasterConfig>): Promise<Readonly<MasterConfig>>;
  read(appId: AppId): Promise<Readonly<MasterConfig>>;
}
