import { ReadonlyDeep } from "type-fest";

export abstract class ReadOnlyConfigAccessor<
  TRecord extends Record<string, unknown>,
  Optional extends true | false = true
> {
  abstract get<T extends keyof TRecord>(
    key: T
  ): Promise<Readonly<TRecord[T]> | (Optional extends true ? undefined : never)>;
  abstract getAllValue(): Promise<
    Optional extends true ? Partial<ReadonlyDeep<TRecord>> : ReadonlyDeep<TRecord>
  >;
}
