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

  protected abstract defaultValue(): StoreValue<T, StoreNames<T>>;

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

  protected async get(keyId: StoreNames<T>): Promise<Readonly<StoreValue<T, StoreNames<T>>>> {
    const store = await this.storePromise;
    const value = await store.get(keyId);
    return value ?? this.defaultValue();
  }

  protected async set(
    keyId: StoreNames<T>,
    value: Partial<StoreValue<T, StoreNames<T>>> | undefined
  ): Promise<Readonly<StoreValue<T, StoreNames<T>>>> {
    const store = await this.storePromise;
    const defaultValue = this.defaultValue();

    const setValue = Object.assign(defaultValue, value);

    const result = await store.set(keyId, setValue);
    return (await result.get(keyId)) ?? this.defaultValue();
  }
}
