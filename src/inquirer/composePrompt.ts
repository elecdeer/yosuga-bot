import hash from "object-hash";

import type { ComponentPayload, PromptFactory, PromptParts } from "./inquirerTypes";

export const composePrompt = <TResult, TAction, TState>({
  initialState,
  subscribeMessages,
  stateReducer,
  outputComponentParam,
  outputResult,
}: PromptParts<TResult, TAction, TState>): PromptFactory<TResult> => {
  return (updateStatus, updateComponent) => {
    let state = initialState;
    let result = outputResult(state);
    let componentParam = outputComponentParam(state, result);

    const handleAction = (action: TAction) => {
      state = stateReducer(state, action);

      const prevResult = result;
      result = outputResult(state);
      if (!isSameResult(prevResult, result)) {
        updateStatus();
      }

      const prevParam = componentParam;
      componentParam = outputComponentParam(state, result);
      if (!isSameComponentParam(prevParam, componentParam)) {
        updateComponent();
      }
    };

    return {
      getStatus: () => result,
      getComponent: () => componentParam,
      subscribeMessage: async (message) => {
        const cleaners = await Promise.all(
          subscribeMessages.map((hook) => hook(message, handleAction))
        );

        const validCleaners = cleaners.filter((cleaner) => cleaner !== undefined);

        return async () => {
          await Promise.all(validCleaners.map((cleaner) => cleaner()));
        };
      },
    };
  };
};

// eslint-disable-next-line @typescript-eslint/ban-types
const isSameResult = <TResult extends {} | null>(prevResult: TResult, result: TResult): boolean => {
  return hash(prevResult) === hash(result);
};

const isSameComponentParam = (prevParam: ComponentPayload, param: ComponentPayload): boolean => {
  return hash(prevParam) === hash(param);
};
