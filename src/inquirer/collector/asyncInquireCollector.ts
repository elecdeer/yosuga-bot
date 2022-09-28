import assert from "assert";
import objectHash from "object-hash";

import { getLogger } from "../../logger";

import type { IEventFlowHandler } from "../../eventFlow/eventFlow";
import type { AnswerState } from "../types/prompt";

const logger = getLogger("inquireCollector");

export const asyncInquireCollector = <T extends Record<string, AnswerState<unknown>>>(
  rootFlow: IEventFlowHandler<{
    prev: T;
    next: T;
  }>,
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
        status: T[K];
      };
    }[keyof T]
  >;
  allAnswered: IEventFlowHandler<{
    [K in keyof T]: T[K];
  }>;
} => {
  const allFlow = rootFlow.map((status) => {
    return status.next;
  });

  const eachFlowPairs = promptKeys.map((key) => {
    const flow = rootFlow
      .filter((status) => {
        const prevStatus = status.prev[key];
        const currentStatus = status.next[key];

        assert(prevStatus);
        assert(currentStatus);

        logger.trace("check one status changed", {
          prev: prevStatus,
          next: currentStatus,
        });

        return objectHash(prevStatus) !== objectHash(currentStatus);
      })
      .map((status) => status.next[key]);

    return {
      key,
      flow,
    };
  });

  const oneFlows = eachFlowPairs.reduce((acc, { key, flow }) => {
    return {
      ...acc,
      [key]: flow,
    };
  }, {}) as {
    [K in keyof T]: IEventFlowHandler<T[K]>;
  };

  const someFlow = rootFlow.createBranchNode<
    {
      [K in keyof T]: {
        key: K;
        status: T[K];
      };
    }[keyof T]
  >();
  eachFlowPairs.forEach(({ key, flow }) => {
    flow.on((status) => {
      someFlow.emit({
        key,
        status,
      });
    });
  });

  const allAnsweredFlow = rootFlow
    .filter((status) =>
      Object.values(status.next).every((status) => status.condition === "answered")
    )
    .map((status) => status.next);

  return {
    all: allFlow,
    one: oneFlows,
    some: someFlow,
    allAnswered: allAnsweredFlow,
  };
};
