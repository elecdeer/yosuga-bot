import { createEventFlow } from "../../eventFlow/eventFlow";
import { getLogger } from "../../logger";
import { asyncInquireCollector } from "./asyncInquireCollector";

import type { AnswerState } from "../types/prompt";

const logger = getLogger("inquireCollector");

export type RootFlowEvent<T extends Record<string, AnswerState<unknown>>> = {
  states: T;
  dif: {
    [K in keyof T]: {
      key: K;
      state: T[K];
    };
  }[keyof T];
};

export const inquireCollector = <T extends Record<string, AnswerState<unknown>>>(
  promptKeys: (keyof T)[]
) => {
  const rootFlow = createEventFlow<RootFlowEvent<T>>();

  let states: T = promptKeys.reduce((acc, key) => {
    return {
      ...acc,
      [key]: {
        condition: "unanswered",
      },
    };
  }, {} as T);

  const updateStates = <K extends keyof T>(key: K, state: T[K]) => {
    states = {
      ...states,
      [key]: state,
    };
    rootFlow.emit({
      states: states,
      dif: {
        key,
        state,
      },
    });
  };

  const close = () => {
    rootFlow.offAll();
  };

  return {
    updateStates,
    close,
    ...asyncInquireCollector(rootFlow, promptKeys),
    states: () => states,
  };
};
