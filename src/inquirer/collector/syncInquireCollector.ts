import type { IEventFlowHandler } from "../../eventFlow/eventFlow";
import type { AnswerState } from "../types/prompt";

export const syncInquireCollector = <T extends Record<string, AnswerState<unknown>>>(
  rootFlow: IEventFlowHandler<{
    prev: T;
    next: T;
  }>,
  promptKeys: (keyof T)[]
) => {
  let states: T = promptKeys.reduce((acc, key) => {
    return {
      ...acc,
      [key]: {
        condition: "unanswered",
      },
    };
  }, {} as T);

  rootFlow.on((statesChange) => {
    states = statesChange.next;
  });

  return {
    states: () => states,
  };
};
