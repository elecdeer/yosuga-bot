import { Collection } from "discord.js";

import { TypedEventEmitter } from "../util/typedEventEmitter";
import {
  AnswerStatus,
  PromptCollector,
  PromptComponent,
  PromptComponentValue,
  PromptEvent,
  PromptResult,
  PromptStatus,
} from "./promptTypes";

export const createPromptCollector = <T extends Record<string, PromptComponent<unknown>>>(
  answerStatus: Collection<keyof T, AnswerStatus<PromptComponentValue<T[keyof T]>>>,
  event: TypedEventEmitter<PromptEvent<T>>
): PromptCollector<T> => {
  const awaitOne: PromptCollector<T>["awaitOne"] = (watchKey) =>
    new Promise((resolve, reject) => {
      const initStatus = answerStatus.get(watchKey)!;
      if (initStatus.status === "answered") {
        resolve(initStatus.value);
      }

      const handler = ({ key, status }: PromptEvent<T>["update"]) => {
        if (key === watchKey && status.status === "answered") {
          event.off("update", handler);
          resolve(status.value);
        }
      };
      event.on("update", handler);

      event.once("close", () => {
        event.off("update", handler);
        reject("closed");
      });
    });

  const reduceAnswerStatusToObj = (): PromptStatus<T> =>
    answerStatus.reduce<PromptStatus<T>>((acc, cur, key) => {
      return {
        ...acc,
        [key]: cur,
      };
    });

  const reduceAnswerResultToObj = (): PromptResult<T> =>
    answerStatus.reduce<PromptResult<T>>((acc, cur, key) => {
      return {
        ...acc,
        [key]: cur.status === "answered" ? cur.value : null,
      };
    });

  const awaitAll: PromptCollector<T>["awaitAll"] = () =>
    new Promise((resolve, reject) => {
      //全てansweredになったタイミングでの状態を返したいのでawaitOneの組合せではだめ
      const checkAllAnswered = () => answerStatus.every((status) => status.status === "answered");

      if (checkAllAnswered()) {
        resolve(reduceAnswerResultToObj());
      }

      const handler = () => {
        if (checkAllAnswered()) {
          event.off("update", handler);
          resolve(reduceAnswerResultToObj());
        }
      };
      event.on("update", handler);

      event.once("close", () => {
        event.off("update", handler);
        reject("closed");
      });
    });

  const onUpdateAny: PromptCollector<T>["onUpdateAny"] = (callback) => {
    const handler = ({ key }: PromptEvent<T>["update"]) => {
      callback(reduceAnswerStatusToObj(), key);
    };
    event.on("update", handler);

    event.once("close", () => {
      event.off("update", handler);
    });
  };

  const onUpdateOne: PromptCollector<T>["onUpdateOne"] = (watchKey, callback) => {
    const handler = ({ key }: PromptEvent<T>["update"]) => {
      if (key === watchKey) {
        callback(answerStatus.get(watchKey)!, watchKey);
      }
    };
    event.on("update", handler);

    event.once("close", () => {
      event.off("update", handler);
    });
  };

  return {
    getStatus: () => reduceAnswerStatusToObj(),
    onUpdateAny,
    onUpdateOne,
    awaitAll,
    awaitOne,
  };
};
