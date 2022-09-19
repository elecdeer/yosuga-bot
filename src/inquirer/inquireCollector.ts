import assert from "assert";
import objectHash from "object-hash";

import { createEventFlow } from "../eventFlow/eventFlow";
import { getLogger } from "../logger";

import type { IEventFlowHandler, IEventFlowEmitter } from "../eventFlow/eventFlow";
import type { AnswerStatus } from "./types/prompt";
import type { Collection } from "discord.js";

const logger = getLogger("inquireCollector");

export const inquireCollector = <T extends Record<string, AnswerStatus<unknown>>>(
  promptKeys: (keyof T)[]
): {
  root: IEventFlowEmitter<{
    prev: Collection<keyof T, AnswerStatus<unknown>>;
    next: Collection<keyof T, AnswerStatus<unknown>>;
  }>;
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
  const rootFlow = createEventFlow<{
    prev: Collection<keyof T, AnswerStatus<unknown>>;
    next: Collection<keyof T, AnswerStatus<unknown>>;
  }>();
  const allFlow = rootFlow.map((status) => {
    return Object.fromEntries(status.next.map((value, key) => [key, value])) as {
      [K in keyof T]: T[K];
    };
  });

  const eachFlowsEntries = promptKeys.map((key) => {
    const flow = rootFlow
      .filter((status) => {
        const prevStatus = status.prev.get(key);
        const currentStatus = status.next.get(key);

        assert(prevStatus);
        assert(currentStatus);

        logger.trace("check one status changed", {
          prev: prevStatus,
          next: currentStatus,
        });

        return objectHash(prevStatus) !== objectHash(currentStatus);
      })
      .map((status) => status.next.get(key)!);
    return [key, flow] as const;
  });
  const oneFlow = Object.fromEntries(eachFlowsEntries) as unknown as {
    [K in keyof T]: IEventFlowHandler<T[K]>;
  };

  const someFlow = createEventFlow<
    {
      [K in keyof T]: {
        key: K;
        status: T[K];
      };
    }[keyof T]
  >();
  eachFlowsEntries.forEach(([key, flow]) => {
    flow.on((value) => {
      someFlow.emit({
        key: key,
        status: value as T[keyof T],
      });
    });
  });

  const allAnsweredFlow = rootFlow
    .filter((status) => {
      return status.next.every((status) => status.condition === "answered");
    })
    .map((status) => {
      return Object.fromEntries(status.next.map((value, key) => [key, value])) as {
        [K in keyof T]: T[K];
      };
    });

  return {
    root: rootFlow,
    all: allFlow,
    one: oneFlow,
    some: someFlow,
    allAnswered: allAnsweredFlow,
  };
};
