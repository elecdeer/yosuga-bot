import { resolveLazy } from "../../util/lazy";
import { assertHookValue, getHookContext } from "../hookContext";

import type { Lazy } from "../../util/lazy";
import type { HookContext } from "../hookContext";

const hookType = "useState";
const assertHook = assertHookValue(hookType);

export const useState = <T>(initial: Lazy<T>) => {
  const ctx = getHookContext();
  return useStateWithContext(ctx)(initial);
};

export const useStateWithContext =
  (ctx: HookContext) =>
  <T>(initial: Lazy<T>): [T, (dispatch: Lazy<T, T>) => void] => {
    const current = ctx.index;
    ctx.logger.trace("useState Call", current);
    ctx.index++;

    assertHook(ctx, current);

    //前の値が無いなら初期化
    if (!(current in ctx.hookValues)) {
      ctx.logger.trace("initialize state", current);
      ctx.hookValues[current] = {
        value: resolveLazy(initial),
        hookType: hookType,
        index: current,
      };
    }

    const currentValue = ctx.hookValues[current].value as T;
    return [
      currentValue,
      (dispatch: Lazy<T, T>) => {
        ctx.hookValues[current] = {
          value: resolveLazy(dispatch, currentValue),
          hookType: hookType,
          index: current,
        };
        ctx.dispatch();
      },
    ];
  };
