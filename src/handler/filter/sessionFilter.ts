import { Session } from "../../session";
import { EventFilterGenerator, filterer } from "./eventFilter";

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
