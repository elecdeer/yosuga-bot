import { Collection } from "discord.js";

import { createReplyHelper, ReplyDestination } from "../util/replyHelper";
import { TypedEventEmitter } from "../util/typedEventEmitter";
import { createPromptCollector } from "./promptCollector";
import { createPromptController } from "./promptController";
import {
  AnswerStatus,
  PromptCollector,
  PromptComponent,
  PromptComponentValue,
  PromptController,
  PromptEvent,
  PromptParam,
} from "./promptTypes";

export const prompt = async <T extends Record<string, PromptComponent<unknown>>>(
  components: T,
  replyDestination: ReplyDestination,
  param: PromptParam
): Promise<{
  controller: PromptController;
  collector: PromptCollector<T>;
}> => {
  const componentCollection = new Collection<keyof T, T[keyof T]>(
    Object.entries(components) as [keyof T, T[keyof T]][]
  );
  const replyHelper = createReplyHelper(replyDestination, param);

  const answerStatus = componentCollection.mapValues((com) => com.getStatus()) as Collection<
    keyof T,
    AnswerStatus<PromptComponentValue<T[keyof T]>>
  >;

  const event = new TypedEventEmitter<PromptEvent<T>>();
  //一番最初にこのイベントハンドラが呼ばれる必要がある
  event.on("update", ({ key, status }) => {
    answerStatus.set(key, status);
  });

  const controller = await createPromptController(
    componentCollection,
    event,
    replyDestination,
    param
  );
  const collector = createPromptCollector(answerStatus, event);

  return {
    collector: collector,
    controller: controller,
  };
};
