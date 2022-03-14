import { Awaitable, ClientEvents } from "discord.js";

export type Listener<TEvent extends keyof ClientEvents> = (
  ...args: ClientEvents[TEvent]
) => Awaitable<void>;

export type EventFilter<TEvent extends keyof ClientEvents, TFilterArgs> = (
  ...args: [TFilterArgs]
) => (listener: Listener<TEvent>) => Listener<TEvent>;

export type FilterChecker<TEvent extends keyof ClientEvents, TFilterArgs> = (
  ...args: [TFilterArgs]
) => (...args: ClientEvents[TEvent]) => boolean;

/**
 * FilterCheckerからEventFilterを生成
 * @param checker
 */
export const filterer = <TEvent extends keyof ClientEvents, TFilterArgs>(
  checker: FilterChecker<TEvent, TFilterArgs>
): EventFilter<TEvent, TFilterArgs> => {
  return (checkerArgs) => {
    return (listener) => {
      const appliedChecker = checker(checkerArgs);
      return (...args) => {
        if (appliedChecker(...args)) {
          return listener(...args);
        }
      };
    };
  };
};
