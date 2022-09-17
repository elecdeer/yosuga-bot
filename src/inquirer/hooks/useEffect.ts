import { assertHookValue, getHookContext } from "../hookContext";

import type { HookContext } from "../hookContext";
import type { Message } from "discord.js";

const hookType = "useEffect";
const assertHook = assertHookValue(hookType);

export const useEffect = (
  callback: (message: Message) => void | (() => void),
  deps?: unknown[]
) => {
  const ctx = getHookContext();
  return useEffectWithContext(ctx)(callback, deps);
};

export const useEffectWithContext =
  (ctx: HookContext) => (callback: (message: Message) => void | (() => void), deps?: unknown[]) => {
    const current = ctx.index;
    ctx.logger.trace("useEffect Call", current);
    ctx.index++;

    assertHook(ctx, current);

    const prevDeps = ctx.hookValues[current]?.value as unknown[] | undefined;
    const changed =
      prevDeps === undefined || deps === undefined || deps.some((dep, i) => dep !== prevDeps[i]);

    if (changed) {
      //前回のrender時とdepsが変わっていたらcb実行を予約
      ctx.mountHooks.push((message) => {
        ctx.logger.trace("set mount handler", current);
        const clean = callback(message);

        if (clean !== undefined) {
          ctx.logger.trace("set unmount handler", current);
          ctx.unmountHooks.push(clean);
        }
      });
    }

    ctx.hookValues[current] = {
      value: deps,
      hookType: hookType,
      index: current,
    };
  };
