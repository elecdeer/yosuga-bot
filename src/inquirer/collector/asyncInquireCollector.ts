import { getLogger } from "../../logger";

import type { IEventFlowHandler } from "../../eventFlow/eventFlow";
import type { AnswerState } from "../types/prompt";
import type { RootFlowEvent } from "./inquireCollector";

const logger = getLogger("inquireCollector");

export const asyncInquireCollector = <T extends Record<string, AnswerState<unknown>>>(
  rootFlow: IEventFlowHandler<RootFlowEvent<T>>,
  promptKeys: (keyof T)[]
): {
  all: IEventFlowHandler<{
    [K in keyof T]: T[K];
  }>;
  one: {
    [K in keyof T]: IEventFlowHandler<T[K]>;
  };
  some: IEventFlowHandler<
    {
      [K in keyof T]: {
        key: K;
        state: T[K];
      };
    }[keyof T]
  >;
  allAnswered: IEventFlowHandler<{
    [K in keyof T]: T[K];
  }>;
} => {
  const allFlow = rootFlow.map((event) => event.states);

  const oneFlows = promptKeys.reduce(
    (acc, key) => {
      return {
        ...acc,
        [key]: rootFlow.filter(({ dif }) => dif.key === key).map(({ dif }) => dif.state),
      };
    },
    {} as {
      [K in keyof T]: IEventFlowHandler<T[K]>;
    }
  );

  const someFlow = rootFlow.map(({ dif }) => dif);

  const allAnsweredFlow = rootFlow
    .filter(({ states }) => Object.values(states).every((state) => state.condition === "answered"))
    .map(({ states }) => states);

  return {
    all: allFlow,
    one: oneFlows,
    some: someFlow,
    allAnswered: allAnsweredFlow,
  };
};
