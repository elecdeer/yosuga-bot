import { User } from "discord.js";
import { getLogger } from "log4js";

import { CommandPermission, hasMemberPermission } from "../../application/permission";
import { removeMentionInMessageContent } from "../../util/removeMention";
import { FilterCheckerGenerator, filterGenerator } from "./eventFilter";
import { isMessageMentionedCall } from "./messageMentionFilter";

const logger = getLogger("textCommandFilter");

export const isTextCommandCall: FilterCheckerGenerator<
  "messageCreate",
  {
    yosugaUser: User;
    permission: CommandPermission;
    prefix: string;
  }
> =
  ({ permission, prefix, yosugaUser }) =>
  async (message) => {
    if (!message.member) return false;
    if (message.author.bot) return false;
    if (!isMessageMentionedCall(yosugaUser)(message)) return false;
    if (!removeMentionInMessageContent(message.content).startsWith(prefix)) return false;

    return await hasMemberPermission(message.member, permission);
  };

export const textCommandFilter = filterGenerator(isTextCommandCall);
