import { Awaitable, ClientEvents } from "discord.js";

export type Listener<TEvent extends keyof ClientEvents> = (
  ...args: ClientEvents[TEvent]
) => Awaitable<void>;

export type EventFilterGenerator<TEvent extends keyof ClientEvents, TFilterArgs> = (
  ...args: [TFilterArgs]
) => EventFilter<TEvent>;

export type EventFilter<TEvent extends keyof ClientEvents> = (
  listener: Listener<TEvent>
) => Listener<TEvent>;

export type FilterCheckerGenerator<TEvent extends keyof ClientEvents, TFilterArgs> = (
  ...args: [TFilterArgs]
) => FilterChecker<TEvent>;

export type FilterChecker<TEvent extends keyof ClientEvents> = (
  ...eventArgs: ClientEvents[TEvent]
) => Awaitable<boolean>;

/**
 * FilterCheckerからEventFilterGeneratorを生成
 * @param checker
 */
export const filterGenerator = <TEvent extends keyof ClientEvents, TGenerateParam>(
  checker: FilterCheckerGenerator<TEvent, TGenerateParam>
): EventFilterGenerator<TEvent, TGenerateParam> => {
  return (checkerArgs) => {
    return (listener) => {
      const appliedChecker = checker(checkerArgs);
      return async (...args) => {
        if (await appliedChecker(...args)) {
          return listener(...args);
        }
      };
    };
  };
};

export const filterer = <TEvent extends keyof ClientEvents>(
  checker: FilterChecker<TEvent>
): EventFilter<TEvent> => {
  return (listener) => {
    return async (...args) => {
      if (await checker(...args)) {
        return listener(...args);
      }
    };
  };
};

export const composeFilter = <TEvent extends keyof ClientEvents>(
  ...filters: EventFilter<TEvent>[]
): EventFilter<TEvent> => {
  return (listener) => {
    return filters.reduceRight((prev, next) => (listener) => next(prev(listener)))(listener);
  };
};
