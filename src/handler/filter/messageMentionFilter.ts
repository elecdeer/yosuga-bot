import { User } from "discord.js";

import { FilterChecker } from "./eventFilter";

export const isMessageMentionedCall: FilterChecker<"messageCreate", Readonly<User>> = (
  targetUser
) => {
  return (message) => {
    return message.mentions.users.some((user) => targetUser.id === user.id);
  };
};
