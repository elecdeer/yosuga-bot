import type { Logger } from "../../logger";
import type { Messenger } from "./messenger";

export const withLog = (messenger: Messenger, logger: Logger): Messenger => {
  return {
    send: async (param, target) => {
      logger.debug("send", {
        param: param,
        target: target,
      });
      return await messenger.send(param, target);
    },
    edit: async (param, message) => {
      logger.debug("edit", {
        param: param,
        message: message.toString(),
      });
      return await messenger.edit(param, message);
    },
    editLatest: async (param) => {
      logger.debug("editLatest", {
        param: param,
      });
      return await messenger.editLatest(param);
    },
    postedMessages: () => messenger.postedMessages(),
  };
};
