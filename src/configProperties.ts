import { UnifiedConfig, ValueResolvableOptional } from "./configManager";

export abstract class ConfigProperties {
  abstract set<T extends keyof UnifiedConfig>(
    key: T,
    value: ValueResolvableOptional<UnifiedConfig[T]>
  ): Promise<UnifiedConfig[T]>;

  abstract get<T extends keyof UnifiedConfig>(key: T): Promise<UnifiedConfig[T] | undefined>;
}
