import { ValueResolvableOptional } from "../typesConfig";
import { ReadOnlyConfigAccessor } from "./readOnlyConfigAccessor";

export abstract class ConfigAccessor<
  TRecord extends Record<string, unknown>
> extends ReadOnlyConfigAccessor<TRecord> {
  abstract set<T extends keyof Required<TRecord>>(
    key: T,
    value: ValueResolvableOptional<TRecord[T]>
  ): Promise<Readonly<TRecord[T]>>;
}
