import { filterer } from "./eventFilter";

import type { Session } from "../../session";
import type { EventFilterGenerator } from "./eventFilter";

export const voiceStatusSessionFilter: EventFilterGenerator<
  "voiceStateUpdate",
  Readonly<Session>
> = (session) =>
  filterer<"voiceStateUpdate">((oldState, _) => {
    const guild = oldState.guild;
    return guild !== null && guild.id === session.guild.id;
  });

export const messageCreateSessionFilter: EventFilterGenerator<
  "messageCreate",
  Readonly<Session>
> = (session) =>
  filterer<"messageCreate">((message) => {
    const guild = message.guild;
    return guild !== null && guild.id === session.guild.id;
  });
