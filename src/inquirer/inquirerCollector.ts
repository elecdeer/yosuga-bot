import { createEventFlow } from "../eventFlow/eventFlow";

import type {
  InquirerCollector,
  PromptsResult,
  PromptsStatus,
  PromptValue,
} from "./types/inquirer";
import type { Prompt } from "./types/prompt";
import type { Collection } from "discord.js";

export const createInquireCollector = <T extends Record<string, Prompt<unknown>>>(
  collection: Collection<keyof T, T[keyof T]>
) => {
  const updateEvent = createEventFlow<keyof T>();
  const closeEvent = createEventFlow();
  closeEvent.once(() => {
    updateEvent.offAll();
  });

  const close = () => {
    closeEvent.emit();
  };

  const updateStatus = (key: keyof T) => {
    updateEvent.emit(key);
  };

  const getResult = () => {
    const entries = collection.map((prompt, key) => [key, prompt.getStatus().value]);
    return Object.fromEntries(entries) as PromptsResult<T>;
  };

  const getStatus: InquirerCollector<T>["getStatus"] = () => {
    const entries = collection.map((prompt, key) => [key, prompt.getStatus()]);
    return Object.fromEntries(entries) as PromptsStatus<T>;
  };

  const awaitOne: InquirerCollector<T>["awaitOne"] = <TKey extends keyof T>(watchKey: TKey) => {
    const initStatus = collection.get(watchKey)!.getStatus();
    if (initStatus.status === "answered") {
      return Promise.resolve<PromptValue<T[TKey]>>(initStatus.value as PromptValue<T[TKey]>);
    }

    return new Promise<PromptValue<T[TKey]>>((resolve, reject) => {
      updateEvent
        .filter((key) => {
          if (key !== watchKey) return false;

          //要らないかも
          const status = collection.get(key)!.getStatus().status;
          return status === "answered" || status === "rejected";
        })
        .once((key) => {
          const status = collection.get(key)!.getStatus();
          if (status.status === "answered") {
            resolve(status.value as PromptValue<T[TKey]>);
          }
          if (status.status === "rejected") {
            reject(status.reason);
          }
        });
    });
  };

  const awaitAll: InquirerCollector<T>["awaitAll"] = () =>
    new Promise<PromptsResult<T>>((resolve, reject) => {
      //全てansweredになったタイミングでの状態を返したいのでawaitOneの組合せではだめ
      const getAllStatus = () => collection.mapValues((prompt) => prompt.getStatus());

      const checkAllAnswered = () => getAllStatus().every((status) => status.status === "answered");
      const checkSomeRejected = () =>
        getAllStatus().find((status) => status.status === "rejected") as
          | { status: "rejected"; reason: string }
          | undefined;

      //既になっているか
      if (checkAllAnswered()) {
        resolve(getResult());
      }
      //既になっているか
      const checkRejected = checkSomeRejected();
      if (checkRejected) {
        reject(checkRejected.reason);
      }

      updateEvent.on(() => {
        if (checkAllAnswered()) {
          resolve(getResult());
        }
        const checkRejected = checkSomeRejected();
        if (checkRejected) {
          reject(checkRejected.reason);
        }
      });

      closeEvent.once(() => {
        reject("closed");
      });
    });

  const onUpdateAny: InquirerCollector<T>["onUpdateAny"] = (callback) => {
    updateEvent.on((key) => {
      void callback(getStatus(), key);
    });
  };

  const onUpdateOne: InquirerCollector<T>["onUpdateOne"] = <TKey extends keyof T>(
    watchKey: TKey,
    callback: (status: PromptsStatus<T>[TKey], key: TKey) => void
  ) => {
    updateEvent
      .filter((key) => key === watchKey)
      .on(() => {
        void callback(collection.get(watchKey)!.getStatus() as PromptsStatus<T>[TKey], watchKey);
      });
  };

  const collector: InquirerCollector<T> = {
    getStatus,
    onUpdateAny,
    onUpdateOne,
    awaitAll,
    awaitOne,
  };

  return {
    collector,
    updateStatus,
    close,
  };
};
