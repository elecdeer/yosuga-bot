import { resolveLazy } from "../lazy";
import { createMessengerBase } from "./messengerBase";
import { sendTextChannelMessage } from "./textChannelMessenger";
import { sendThreadMessage } from "./threadMessenger";

import type { Lazy } from "../lazy";
import type { MessageParam, Messenger, ReplyTarget } from "./messenger";
import type { AllowedThreadTypeForTextChannel, TextChannel, ThreadCreateOptions } from "discord.js";
import type { ThreadChannel } from "discord.js";

export const createNewThreadMessenger = (
  channel: TextChannel,
  option: Omit<ThreadCreateOptions<AllowedThreadTypeForTextChannel>, "startMessage">,
  startMessageParam: Lazy<MessageParam, ThreadChannel | null>
): Messenger => {
  let thread: ThreadChannel | null = null;

  const createThread = async (target: ReplyTarget) => {
    const startMessage = await sendTextChannelMessage(channel)(
      resolveLazy(startMessageParam, null),
      target
    );
    thread = await startMessage.startThread(option);
    await startMessage.edit(resolveLazy(startMessageParam, thread));

    return thread;
  };

  return createMessengerBase(async (param, target) => {
    if (thread === null) {
      thread = await createThread(target);

      return sendThreadMessage(thread)(param, {
        type: "channel",
      });
    } else {
      return sendThreadMessage(thread)(param, target);
    }
  });
};
