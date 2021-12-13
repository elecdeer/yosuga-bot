import { ReadonlyDeep } from "type-fest";

export abstract class ReadOnlyConfigAccessor<TRecord extends Record<string, unknown>> {
  abstract get<T extends keyof TRecord>(key: T): Promise<Readonly<TRecord[T]> | undefined>;
  abstract getAllValue(): Promise<ReadonlyDeep<TRecord>>;
}
