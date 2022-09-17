import { Collection } from "discord.js";

import { getLogger } from "../logger";
import { createHookContext } from "./hookContext";
import { inquireCollector } from "./inquireCollector";
import { inquirerMessageProxy } from "./inquirerMessageProxy";

import type { InquirerOption, InquirerOptionTimer } from "./types/inquire";
import type { AnswerStatus, Prompt } from "./types/prompt";

const logger = getLogger("inquire");

export const inquire = <T extends Record<string, Prompt<unknown>>>(
  prompts: T | [keyof T, T[keyof T]][],
  option: InquirerOption
) => {
  const { messenger, rootTarget, idle, time, messageContent, ephemeral } = option;
  const timerParam: InquirerOptionTimer = {
    time,
    idle,
  };

  const messageProxy = inquirerMessageProxy({
    messenger,
    messageContent,
    ephemeral,
    rootTarget,
  });

  const promptCollection = new Collection<keyof T, T[keyof T]>(
    Array.isArray(prompts) ? prompts : (Object.entries(prompts) as [keyof T, T[keyof T]][])
  );

  const queueDispatch = immediateThrottle(() => {
    void edit();
  });
  const controller = createHookContext(queueDispatch);

  const resolvePrompts = () => {
    controller.startRender();
    const renderResults = promptCollection.mapValues((prompt) => prompt());
    controller.endRender();

    return {
      component: renderResults.mapValues((result) => result.component),
      status: renderResults.mapValues((result) => result.status),
    };
  };

  const send = async () => {
    const { component, status } = resolvePrompts();
    const message = await messageProxy.send(Array.from(component.values()));
    controller.afterMount(message);

    await updateStatus(status);

    return message;
  };

  const edit = async () => {
    const { component, status } = resolvePrompts();
    const message = await messageProxy.edit(Array.from(component.values()));
    if (message !== null) {
      controller.beforeUnmount();
      controller.afterMount(message);
    }
    await updateStatus(status);

    return message;
  };

  //初回
  setImmediate(() => {
    void send();
  });

  const updateStatus = async (
    statusList: Collection<keyof T, AnswerStatus<unknown>>
  ) => {
    logger.trace("updateStatus", statusList);
    inquireController.root.emit(statusList);
  };

  const inquireController = inquireCollector<T>(Array.from(promptCollection.keys()));

  return {
    controller: {
      send,
      edit,
    },
    collector: inquireController,
  };
};

const immediateThrottle = (fn: () => void) => {
  let isPending = false;

  return () => {
    logger.trace("throttle");
    if (isPending) {
      logger.trace("skip");
      return;
    }
    isPending = true;
    logger.trace("enqueue");
    setImmediate(() => {
      logger.trace("execute");
      fn();
      isPending = false;
    });
    // queueMicrotask(() => {
    //   logger.trace("execute");
    //   fn();
    //   isPending = false;
    // });
  };
};
