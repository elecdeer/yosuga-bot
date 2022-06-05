export type Lazy<T> = T | (() => T);

type ResolveLazy = {
  <T>(lazy: Lazy<T>): T;
  <T>(lazy: Lazy<T> | undefined): T | undefined;
};

export const resolveLazy: ResolveLazy = (lazy) => {
  if (lazy === undefined) return undefined;
  if (lazy instanceof Function) {
    return lazy();
  } else {
    return lazy;
  }
};
