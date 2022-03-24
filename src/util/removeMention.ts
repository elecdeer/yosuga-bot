import { MessageMentions } from "discord.js";

const headSpaceRegexp = /^\s*/;

/**
 * message.contentのメンションを取り除く
 * @param content
 */
export const removeMentionInMessageContent = (content: string) => {
  return content.replace(MessageMentions.USERS_PATTERN, "").replace(headSpaceRegexp, "");
};
