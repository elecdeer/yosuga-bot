import { filterGenerator } from "./eventFilter";

import type { FilterCheckerGenerator } from "./eventFilter";
import type { ClientEvents } from "discord.js";
import type { Logger } from "log4js";

type TapEventArgs<TEvent extends keyof ClientEvents> = {
  logger: Logger;
  textGen: (...eventArg: ClientEvents[TEvent]) => string;
};

const tapEvent = <TEvent extends keyof ClientEvents>({
  logger,
  textGen,
}: TapEventArgs<TEvent>): ReturnType<FilterCheckerGenerator<TEvent, unknown>> => {
  return (...eventArgs) => {
    logger.debug(textGen(...eventArgs));
    return true;
  };
};

/**
 * フィルタはせずにログを呼ぶフィルタ
 */
export const tapLogFilter = filterGenerator(tapEvent);
