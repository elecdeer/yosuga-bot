import type { Except } from "type-fest";

//Lazy
export type Lazy<T> = T | (() => T);

export type ResolvedLazy<T extends Lazy<unknown>> = T extends (param: void) => unknown
  ? ReturnType<T>
  : T;

function resolveLazy<T>(lazy: Lazy<T>): T;
function resolveLazy<T>(lazy: Lazy<T> | undefined): T | undefined {
  if (lazy === undefined) return undefined;
  if (lazy instanceof Function) {
    return lazy();
  } else {
    return lazy;
  }
}

//LazyParam
type LazyParamAll<T> = {
  [K in keyof T]: Lazy<T[K]>;
};
export type LazyParam<T, Keys extends keyof T = keyof T> = Except<T, Keys> &
  LazyParamAll<Pick<T, Keys>>;

export type ResolvedLazyParam<T, Keys extends keyof T = keyof T> = {
  [K in Keys]: ResolvedLazy<T[K]>;
} & Except<T, Keys>;

function resolveLazyParam<T>(lazy: LazyParam<T, keyof T>): ResolvedLazyParam<T, keyof T>;
function resolveLazyParam<T>(
  lazy: LazyParam<T, keyof T> | undefined
): ResolvedLazyParam<T, keyof T> | undefined;
function resolveLazyParam<T, Keys extends keyof T>(
  lazy: LazyParam<T, Keys>,
  keys?: Keys[]
): ResolvedLazyParam<T, Keys>;
function resolveLazyParam<T, Keys extends keyof T>(
  lazy: LazyParam<T, Keys> | undefined,
  keys?: Keys[]
): ResolvedLazyParam<T, Keys> | undefined {
  if (lazy === undefined) return undefined;
  if (keys === undefined) {
    return Object.fromEntries(
      Object.entries(lazy).map(([key, value]) => [key, resolveLazy(value)])
    ) as ResolvedLazyParam<T, Keys>;
  }
  return Object.fromEntries(
    Object.entries(lazy).map(([key, value]) =>
      keys.includes(key as Keys) ? [key, resolveLazy(value)] : [key, value]
    )
  ) as ResolvedLazyParam<T, Keys>;
}

export { resolveLazy, resolveLazyParam };
