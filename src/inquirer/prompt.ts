import { Collection } from "discord.js";

import { createPromptCollector } from "./promptCollector";
import { createPromptController } from "./promptController";
import { TypedEventEmitter } from "../util/typedEventEmitter";

import type {
  AnswerStatus,
  PromptCollector,
  PromptComponent,
  PromptComponentValue,
  PromptController,
  PromptEvent,
  PromptParam,
} from "./promptTypes";

export const prompt = async <T extends Record<string, PromptComponent<unknown>>>(
  components: T | [keyof T, T[keyof T]][],
  param: PromptParam
): Promise<{
  controller: PromptController;
  collector: PromptCollector<T>;
}> => {
  const componentCollection = new Collection<keyof T, T[keyof T]>(
    Array.isArray(components) ? components : (Object.entries(components) as [keyof T, T[keyof T]][])
  );

  const answerStatus = componentCollection.mapValues((com) => com.getStatus()) as Collection<
    keyof T,
    AnswerStatus<PromptComponentValue<T[keyof T]>>
  >;

  const event = new TypedEventEmitter<PromptEvent<T>>();
  //一番最初にこのイベントハンドラが呼ばれる必要がある
  event.on("update", ({ key, status }) => {
    answerStatus.set(key, status);
  });

  const controller = await createPromptController(componentCollection, event, param);
  const collector = createPromptCollector(answerStatus, event);

  return {
    collector: collector,
    controller: controller,
  };
};
