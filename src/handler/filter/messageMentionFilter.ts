import type { FilterCheckerGenerator } from "./eventFilter";
import type { User } from "discord.js";

export const isMessageMentionedCall: FilterCheckerGenerator<"messageCreate", Readonly<User>> = (
  targetUser
) => {
  return (message) => {
    return message.mentions.users.some((user) => targetUser.id === user.id);
  };
};
