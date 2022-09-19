import { getLogger } from "../logger";

import type { Logger } from "../logger";
import type { Message } from "discord.js";

export type HookContext = {
  index: number;
  hookValues: {
    value: unknown;
    hookType: string;
    index: number;
  }[];
  mountHooks: ((message: Message) => void)[];
  unmountHooks: (() => void)[];
  logger: Logger;
  dispatch: () => void;
};

let hookContext: HookContext | undefined;

export const getHookContext = (): HookContext => {
  if (hookContext === undefined) {
    throw new Error("prompt以外の場所でhookは使用できません");
  }
  return hookContext;
};

const bindHookContext = (context: HookContext) => {
  if (hookContext !== undefined) {
    throw new Error("hookContextがbindされています");
  }
  hookContext = context;
};

const unbindHookContext = () => {
  if (hookContext === undefined) {
    throw new Error("hookContextがbindされていません");
  }
  hookContext = undefined;
};

export const createHookContext = (
  queueDispatch: () => void,
  logger: Logger = getLogger("hookContext")
) => {
  const context: HookContext = {
    index: 0,
    hookValues: [],
    mountHooks: [],
    unmountHooks: [],
    logger,
    dispatch: queueDispatch,
  };

  const startRender = () => {
    context.index = 0;
    bindHookContext(context);
  };

  const endRender = () => {
    unbindHookContext();
  };

  const afterMount = (message: Message) => {
    logger.trace("afterMount");
    context.mountHooks.forEach((hook) => hook(message));
    context.mountHooks = [];
  };

  const beforeUnmount = () => {
    logger.trace("beforeUnmount");
    context.unmountHooks.forEach((hook) => hook());
    context.unmountHooks = [];
  };

  const close = () => {
    logger.trace("close");
    beforeUnmount();
  };

  return { startRender, endRender, afterMount, beforeUnmount, close };
};

export const assertHookValue = (hookType: string) => (ctx: HookContext, current: number) => {
  if (ctx.hookValues[current] === undefined) {
    return;
  }
  if (ctx.hookValues[current].hookType !== hookType || ctx.hookValues[current].index !== current) {
    throw new Error("hookを呼び出す順序を変えてはいけません");
  }
};
