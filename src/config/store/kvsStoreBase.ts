import { kvsLocalStorage, KvsLocalStorageSchema } from "@kvs/node-localstorage";
import { KVS, StoreNames, StoreValue } from "@kvs/types";

export type StoreProps = {
  name: string;
  storeFilePath: string;
};

export abstract class KvsStoreBase<T extends KvsLocalStorageSchema> {
  protected storePromise: Promise<KVS<T>>;

  protected constructor(props: StoreProps, version: number) {
    this.storePromise = kvsLocalStorage<T>({
      ...props,
      version: version,
      upgrade: (upgradeParam) => this.upgrade(upgradeParam),
    });
  }

  protected async upgrade({
    kvs,
    oldVersion,
    newVersion,
  }: {
    kvs: KVS<T>;
    oldVersion: number;
    newVersion: number;
  }): Promise<void> {
    //something
  }

  protected async get(
    keyId: StoreNames<T>
  ): Promise<Readonly<StoreValue<T, StoreNames<T>> | undefined>> {
    const store = await this.storePromise;
    return await store.get(keyId);
  }

  protected async set(
    keyId: StoreNames<T>,
    value: StoreValue<T, StoreNames<T>>
  ): Promise<Readonly<StoreValue<T, StoreNames<T>> | undefined>> {
    const store = await this.storePromise;

    const result = await store.set(keyId, value);
    return await result.get(keyId);
  }
}
