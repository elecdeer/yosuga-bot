import { User } from "discord.js";

import { FilterChecker } from "./eventFilter";

export const isMessageMentionedCall: FilterChecker<"messageCreate", Readonly<User>> = (user) => {
  return (message) => {
    return message.mentions.users.some((user) => user.id === user.id);
  };
};
