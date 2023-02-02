import { getLogger } from "log4js";

import type {
  AnswerStatus,
  PromptCollector,
  PromptComponent,
  PromptComponentValue,
  PromptEvent,
  PromptResult,
  PromptStatus,
} from "./promptTypes";
import type { TypedEventEmitter } from "../util/typedEventEmitter";
import type { Collection } from "discord.js";

const logger = getLogger("promptCollector");

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
        if (key !== watchKey) {
          return;
        }

        if (status.status === "answered") {
          event.off("update", handler);
          resolve(status.value);
        }

        if (status.status === "rejected") {
          event.off("update", handler);
          reject(status.reason);
        }
      };
      event.on("update", handler);

      event.once("close", () => {
        event.off("update", handler);
        reject("closed");
      });
    });

  const reduceAnswerStatusToObj = (): PromptStatus<T> =>
    Object.fromEntries(answerStatus.entries()) as PromptStatus<T>;

  const reduceAnswerResultToObj = (): PromptResult<T> => {
    logger.debug(answerStatus);
    return Object.fromEntries(
      answerStatus.mapValues((item) => (item.status === "answered" ? item.value : null)).entries()
    ) as PromptResult<T>;
  };

  const awaitAll: PromptCollector<T>["awaitAll"] = () =>
    new Promise((resolve, reject) => {
      //全てansweredになったタイミングでの状態を返したいのでawaitOneの組合せではだめ
      const checkAllAnswered = () => answerStatus.every((status) => status.status === "answered");
      const checkSomeRejected = () =>
        answerStatus.find((status) => status.status === "rejected") as
          | { status: "rejected"; reason: string }
          | undefined;

      if (checkAllAnswered()) {
        logger.debug(reduceAnswerResultToObj());
        resolve(reduceAnswerResultToObj());
      }

      const checkRejected = checkSomeRejected();
      if (checkRejected) {
        reject(checkRejected.reason);
      }

      const handler = () => {
        if (checkAllAnswered()) {
          event.off("update", handler);
          resolve(reduceAnswerResultToObj());
        }
        const checkRejected = checkSomeRejected();
        if (checkRejected) {
          reject(checkRejected.reason);
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
      void callback(reduceAnswerStatusToObj(), key);
    };
    event.on("update", handler);

    event.once("close", () => {
      event.off("update", handler);
    });
  };

  const onUpdateOne: PromptCollector<T>["onUpdateOne"] = (watchKey, callback) => {
    const handler = ({ key }: PromptEvent<T>["update"]) => {
      if (key === watchKey) {
        void callback(answerStatus.get(watchKey)!, watchKey);
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
