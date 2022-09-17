import { getLogger } from "../logger";

import type { Context } from "./types/inquire";

const logger = getLogger("hookContext");

export const createContext = (queueDispatch: () => void) => {
  const hooks: unknown[] = [];
  const cleanHooks: (() => void)[] = [];
  let index = 0;

  const useState: Context["useState"] = <T>(initial: T) => {
    const current = index;
    logger.trace("useState Call", current);
    index++;

    //初期化されているか
    if (!(current in hooks)) {
      hooks[current] = initial;
    }

    return [
      hooks[current] as T,
      (value: T) => {
        hooks[current] = value;
        queueDispatch();
      },
    ];
  };

  const useEffect: Context["useEffect"] = (callback, deps) => {
    const current = index;
    logger.trace("useEffect Call", current);
    index++;

    const prevDeps = hooks[current] as unknown[] | undefined;
    const changed =
      prevDeps === undefined || deps === undefined || deps.some((dep, i) => dep !== prevDeps[i]);

    if (changed) {
      cleanHooks[current]?.();
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      cleanHooks[current] = callback() ?? (() => {});
    }
  };

  return {
    context: {
      useState,
      useEffect,
    },
    controller: {
      start: () => {
        index = 0;
      },
    },
  };
};
