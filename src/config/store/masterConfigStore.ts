import { AppId } from "../../types";
import { MasterConfig } from "../typesConfig";

export interface MasterConfigStore {
  save(appId: AppId, value: Partial<MasterConfig>): Promise<Readonly<Partial<MasterConfig>>>;
  read(appId: AppId): Promise<Readonly<Partial<MasterConfig>>>;
}
