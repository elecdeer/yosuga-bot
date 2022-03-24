import { User } from "discord.js";

import { FilterCheckerGenerator } from "./eventFilter";

export const isMessageMentionedCall: FilterCheckerGenerator<"messageCreate", Readonly<User>> = (
  targetUser
) => {
  return (message) => {
    return message.mentions.users.some((user) => targetUser.id === user.id);
  };
};
