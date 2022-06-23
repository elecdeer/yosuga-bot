import { TypedEventEmitter } from "../util/typedEventEmitter";

import type {
  Prompt,
  PromptCollector,
  PromptEvent,
  PromptResult,
  PromptStatus,
  PromptValue,
} from "./promptTypes";
import type { Collection } from "discord.js";

export const createInquireCollector = <T extends Record<string, Prompt<unknown>>>(
  collection: Collection<keyof T, T[keyof T]>
) => {
  const event = new TypedEventEmitter<PromptEvent<T>>();

  const updateStatus = (key: keyof T) => {
    event.emit("update", {
      key,
    });
  };

  const getResult = () => {
    const entries = collection.map((prompt, key) => [key, prompt.getStatus().value]);
    return Object.fromEntries(entries) as PromptResult<T>;
  };

  const getStatus: PromptCollector<T>["getStatus"] = () => {
    const entries = collection.map((prompt, key) => [key, prompt.getStatus()]);
    return Object.fromEntries(entries) as PromptStatus<T>;
  };

  const awaitOne: PromptCollector<T>["awaitOne"] = <TKey extends keyof T>(watchKey: TKey) => {
    const initStatus = collection.get(watchKey)!.getStatus();
    if (initStatus.status === "answered") {
      return Promise.resolve<PromptValue<T[TKey]>>(initStatus.value as PromptValue<T[TKey]>);
    }

    return new Promise<PromptValue<T[TKey]>>((resolve, reject) => {
      const handler = ({ key }: PromptEvent<T>["update"]) => {
        if (watchKey !== key) return;

        const status = collection.get(key)!.getStatus();
        if (status.status === "answered") {
          event.off("update", handler);
          resolve(status.value as PromptValue<T[TKey]>);
        }
        if (status.status === "rejected") {
          event.off("update", handler);
          reject(status.reason);
        }
      };

      event.on("update", handler);
    });
  };

  const awaitAll: PromptCollector<T>["awaitAll"] = () =>
    new Promise<PromptResult<T>>((resolve, reject) => {
      //全てansweredになったタイミングでの状態を返したいのでawaitOneの組合せではだめ
      const getAllStatus = () => collection.mapValues((prompt) => prompt.getStatus());

      const checkAllAnswered = () => getAllStatus().every((status) => status.status === "answered");
      const checkSomeRejected = () =>
        getAllStatus().find((status) => status.status === "rejected") as
          | { status: "rejected"; reason: string }
          | undefined;

      if (checkAllAnswered()) {
        resolve(getResult());
      }

      const checkRejected = checkSomeRejected();
      if (checkRejected) {
        reject(checkRejected.reason);
      }

      const handler = () => {
        if (checkAllAnswered()) {
          event.off("update", handler);
          resolve(getResult());
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
      void callback(getStatus(), key);
    };
    event.on("update", handler);

    event.once("close", () => {
      event.off("update", handler);
    });
  };

  const onUpdateOne: PromptCollector<T>["onUpdateOne"] = <TKey extends keyof T>(
    watchKey: TKey,
    callback: (status: PromptStatus<T>[TKey], key: TKey) => void
  ) => {
    const handler = ({ key }: PromptEvent<T>["update"]) => {
      if (key === watchKey) {
        void callback(collection.get(watchKey)!.getStatus() as PromptStatus<T>[TKey], watchKey);
      }
    };
    event.on("update", handler);

    event.once("close", () => {
      event.off("update", handler);
    });
  };

  const collector: PromptCollector<T> = {
    getStatus,
    onUpdateAny,
    onUpdateOne,
    awaitAll,
    awaitOne,
  };

  return {
    collector,
    updateStatus,
  };
};
