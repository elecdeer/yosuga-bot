import { Collection } from "discord.js";

import { getLogger } from "../logger";
import { resolveLazy } from "../util/lazy";
import { createContext } from "./hookContext";

import type { InquirerOption, InquirerOptionMessage, InquirerOptionTimer } from "./types/inquire";
import type { AnswerStatus, ComponentPayload, Prompt } from "./types/prompt";

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

  const messageSender = inquirerMessageSender({
    messenger,
    messageContent,
    ephemeral,
    rootTarget,
  });

  const promptCollection = new Collection<keyof T, T[keyof T]>(
    Array.isArray(prompts) ? prompts : (Object.entries(prompts) as [keyof T, T[keyof T]][])
  );

  const queueDispatch = immediateThrottle(() => {
    void renderPrompt();
  });
  const { context, controller } = createContext(queueDispatch);

  let renderCount = 0;
  const renderPrompt = async () => {
    logger.trace("renderPrompt", renderCount);
    controller.start();
    const renderResults = promptCollection.mapValues((prompt) => prompt(context));
    await updateComponentWhenUpdated(renderResults.map((result) => result.component));
    await updateStatusWhenUpdated(renderResults.map((result) => result.status));

    renderCount++;
  };

  //初回
  queueDispatch();

  const updateStatusWhenUpdated = async (statusList: AnswerStatus<unknown>[]) => {
    //TODO 前回と変わっているかをチェック
    logger.trace("updateStatusWhenUpdated", statusList);
  };

  const updateComponentWhenUpdated = async (componentList: ComponentPayload[]) => {
    //TODO 前回と変わっているかをチェック
    logger.trace("updateComponentWhenUpdated", componentList);
    if (renderCount === 0) {
      await messageSender.send(componentList);
    } else {
      await messageSender.edit(componentList);
    }
  };
};

const inquirerMessageSender = ({
  messenger,
  messageContent,
  ephemeral,
  rootTarget,
}: InquirerOptionMessage) => {
  return {
    send: async (componentList: ComponentPayload[]) => {
      return messenger.send(
        {
          embeds: [resolveLazy(messageContent)],
          components: componentList,
          ephemeral: ephemeral,
        },
        rootTarget
      );
    },
    edit: async (componentList: ComponentPayload[]) => {
      return messenger.editLatest({
        embeds: [resolveLazy(messageContent)],
        components: componentList,
        ephemeral: ephemeral,
      });
    },
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
