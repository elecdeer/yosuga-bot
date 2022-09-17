import assert from "assert";
import { Collection } from "discord.js";
import objectHash from "object-hash";

import { createEventFlow } from "../eventFlow/eventFlow";
import { getLogger } from "../logger";

import type { IEventFlow, IEventFlowHandler } from "../eventFlow/eventFlow";
import type { AnswerStatus } from "./types/prompt";

const logger = getLogger("inquireCollector");

export const inquireCollector = <T extends Record<string, unknown>>(
  promptKeys: (keyof T)[]
): {
  root: IEventFlow<Collection<keyof T, AnswerStatus<unknown>>>;
  all: IEventFlowHandler<{
    [K in keyof T]: AnswerStatus<T[K]>;
  }>;
  one: {
    [K in keyof T]: IEventFlowHandler<AnswerStatus<T[K]>>;
  };
  some: IEventFlowHandler<{
    key: keyof T;
    status: AnswerStatus<unknown>;
  }>;
  allAnswered: IEventFlowHandler<{
    [K in keyof T]: AnswerStatus<T[K]>;
  }>;
} => {
  const rootFlow = createEventFlow<Collection<keyof T, AnswerStatus<unknown>>>();
  let prev = new Collection<keyof T, AnswerStatus<unknown>>(
    promptKeys.map((key) => [
      key,
      {
        status: "unanswered",
      },
    ])
  );

  const allFlow = rootFlow.map((status) => {
    return Object.fromEntries(status.map((value, key) => [key, value])) as {
      [K in keyof T]: AnswerStatus<T[K]>;
    };
  });

  const eachFlowsEntries = promptKeys.map((key) => {
    const flow = rootFlow
      .filter((status) => {
        const prevStatus = prev.get(key);
        const currentStatus = status.get(key);

        assert(prevStatus);
        assert(currentStatus);

        logger.trace("check one status changed", {
          prev: prevStatus,
          next: currentStatus,
        });

        return objectHash(prevStatus) !== objectHash(currentStatus);
      })
      .map((status) => status.get(key)!);
    return [key, flow] as const;
  });
  const oneFlow = Object.fromEntries(eachFlowsEntries) as {
    [K in keyof T]: IEventFlowHandler<AnswerStatus<T[K]>>;
  };

  const someFlow = createEventFlow<{
    key: keyof T;
    status: AnswerStatus<unknown>;
  }>();
  eachFlowsEntries.forEach(([key, flow]) => {
    flow.on((value) => {
      someFlow.emit({
        key: key,
        status: value,
      });
    });
  });

  const allAnsweredFlow = rootFlow
    .filter((status) => {
      return status.every((status) => status.status === "answered");
    })
    .map((status) => {
      return Object.fromEntries(status.map((value, key) => [key, value])) as {
        [K in keyof T]: AnswerStatus<T[K]>;
      };
    });

  //この実装ちょっと怖いかも
  //前回の値はinquire側で持った方がいいかもしれない
  rootFlow.on((status) => {
    setImmediate(() => {
      prev = status;
    });
  });

  return {
    root: rootFlow,
    all: allFlow,
    one: oneFlow,
    some: someFlow,
    allAnswered: allAnsweredFlow,
  };
};
