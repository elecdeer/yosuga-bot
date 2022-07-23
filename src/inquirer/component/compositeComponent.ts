import type { ComponentRowList, PromptFactory, PromptParts, PromptParamHook } from "../promptTypes";

export const compositeComponentParts = <TResult, TAction, TState>(
  parts: (hookParam: PromptParamHook) => PromptParts<TResult, TAction, TState>
): PromptFactory<TResult> => {
  return (hookParam, updateStatus, updateComponent) => {
    const { initialState, hookMessages, stateReducer, outputResult, outputComponentParam } =
      parts(hookParam);

    let state = initialState;
    let result = outputResult(state);
    let componentParam = outputComponentParam(state, result);

    const handleAction = (action: TAction) => {
      const prevState = state;
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
      getStatus: () => outputResult(state),
      getComponent: () => outputComponentParam(state, result),
      hookMessage: async (message) => {
        const cleaners = await Promise.all(hookMessages.map((hook) => hook(message, handleAction)));

        const validCleaners = cleaners.filter((cleaner) => cleaner !== undefined);

        return async () => {
          await Promise.all(validCleaners.map((cleaner) => cleaner()));
        };
      },
    };
  };
};

const isSameResult = <TResult>(prevResult: TResult, result: TResult): boolean => {
  //TODO
  return false;
};

const isSameComponentParam = (prevParam: ComponentRowList, param: ComponentRowList): boolean => {
  //TODO
  return false;
};
