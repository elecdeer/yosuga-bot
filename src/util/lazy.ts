export type Lazy<T> = T | (() => T);

export const resolveLazy = <T>(lazy: Lazy<T>): T => {
  if (lazy instanceof Function) {
    return lazy();
  } else {
    return lazy;
  }
};
