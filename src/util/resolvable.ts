export type ValueResolvable<T> = T | ((value: T | undefined) => T);

// eslint-disable-next-line @typescript-eslint/ban-types
type NotFunction<T> = T extends Function ? never : T;

export const resolveValue = <T extends NotFunction<unknown>>(
  resolvable: ValueResolvable<T>,
  param: T
): T => {
  if (resolvable instanceof Function) {
    return resolvable(param);
  } else {
    return resolvable;
  }
};
