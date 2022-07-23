import { Collection } from "discord.js";

import type { PromptFactory } from "../../promptTypes";

export const withObjectValueOption = <T extends Array<unknown>, U>(
  promptFactory: PromptFactory<T>,
  valueEntries: [T[number], U][]
): PromptFactory<U[]> => {
  const valueCollection = new Collection(valueEntries);

  return (hookParam, updateStatus, updateComponent) => {
    const { hookMessage, getStatus, getComponent } = promptFactory(
      hookParam,
      updateStatus,
      updateComponent
    );

    return {
      hookMessage,
      getStatus: () => {
        const rawStatus = getStatus();

        if (rawStatus.status === "answered") {
          return {
            status: "answered",
            value: rawStatus.value.map((value) => {
              const entry = valueCollection.get(value);
              if (entry === undefined) {
                throw new Error(`${value} is not found in valueCollection`);
              }
              return entry;
            }),
          };
        } else {
          return rawStatus;
        }
      },
      getComponent,
    };
  };
};
