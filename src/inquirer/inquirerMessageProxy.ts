import { Collection } from "discord.js";
import objectHash from "object-hash";

import { resolveLazy } from "../util/lazy";

import type { InquirerOptionMessage } from "./types/inquire";
import type { ComponentPayload } from "./types/prompt";
import type { Message } from "discord.js";

export const inquirerMessageProxy = (option: InquirerOptionMessage) => {
  const { messenger, messageContent, ephemeral, rootTarget } = option;

  const componentsHistory = new Collection<Message, ComponentPayload[]>();

  const send = async (componentList: ComponentPayload[]) => {
    const message = await messenger.send(
      {
        embeds: [resolveLazy(messageContent)],
        ephemeral,
        components: componentList,
      },
      rootTarget
    );

    componentsHistory.set(message, componentList);
    return message;
  };

  const edit = async (componentList: ComponentPayload[]) => {
    const latestMessage = messenger.postedMessages().at(-1);
    const prev = latestMessage && componentsHistory.get(latestMessage);
    if (prev === undefined) {
      return await send(componentList);
    }

    if (!isComponentChanged(prev, componentList)) {
      return null;
    }

    const message = await messenger.editLatest({
      embeds: [resolveLazy(messageContent)],
      ephemeral,
      components: componentList,
    });

    componentsHistory.set(message, componentList);
    return message;
  };

  return {
    send,
    edit,
  };
};

const isComponentChanged = (oldComponent: ComponentPayload[], newComponent: ComponentPayload[]) => {
  return objectHash(oldComponent) !== objectHash(newComponent);
};
