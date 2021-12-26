import { ValueResolvable } from "../../util/resolvable";
import { ReadOnlyConfigAccessor } from "./readOnlyConfigAccessor";

export abstract class ConfigAccessor<
  TRecord extends Record<string, unknown>,
  Optional extends true | false = true
> extends ReadOnlyConfigAccessor<TRecord, Optional> {
  abstract set<T extends keyof Required<TRecord>>(
    key: T,
    value: ValueResolvable<TRecord[T] | (Optional extends true ? undefined : never)>
  ): Promise<Readonly<TRecord[T] | (Optional extends true ? undefined : never)>>;
}
