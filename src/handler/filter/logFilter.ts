import { ClientEvents } from "discord.js";
import { Logger } from "log4js";

import { FilterCheckerGenerator, filterGenerator } from "./eventFilter";

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
