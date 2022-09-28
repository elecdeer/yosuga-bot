import { createEventFlow } from "../../eventFlow/eventFlow";
import { getLogger } from "../../logger";
import { asyncInquireCollector } from "./asyncInquireCollector";

import type { AnswerState } from "../types/prompt";

const logger = getLogger("inquireCollector");

export const inquireCollector = <T extends Record<string, AnswerState<unknown>>>(
  promptKeys: (keyof T)[]
) => {
  const rootFlow = createEventFlow<{
    prev: T;
    next: T;
  }>();

  let prevStates: T = promptKeys.reduce((acc, key) => {
    return {
      ...acc,
      [key]: {
        condition: "unanswered",
      },
    };
  }, {} as T);

  const updateStates = (states: T) => {
    rootFlow.emit({
      prev: prevStates,
      next: states,
    });
    prevStates = states;
  };

  const close = () => {
    rootFlow.offAll();
  };

  return {
    updateStates,
    close,
    ...asyncInquireCollector(rootFlow, promptKeys),
    states: () => prevStates,
  };
};
