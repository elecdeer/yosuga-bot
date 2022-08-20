import { resolveLazy } from "../util/lazy";

import type { ReplyTarget } from "../util/messenger/messenger";
import type { Prompt, PromptController, PromptOptionMessage } from "./inquirerTypes";
import type { Awaitable, Collection, Message } from "discord.js";

export const createInquireController = async (
  promptCollection: Collection<string, Prompt<unknown>>,
  { messenger, rootTarget, ephemeral, messageContent }: PromptOptionMessage
): Promise<PromptController> => {
  let hooksCleaner: (() => Awaitable<void>)[] = [];
  const cleanHooks = async () => {
    await Promise.all(hooksCleaner.map((item) => item()));
  };

  const hookComponents = async (message: Message) => {
    await cleanHooks();

    hooksCleaner = await Promise.all(
      promptCollection.map((prompt) => prompt.subscribeMessage(message))
    );
  };

  const renderPromptComponent = () => promptCollection.map((prompt) => prompt.getComponent());

  const edit = async () => {
    const message = await messenger.editLatest({
      components: renderPromptComponent(),
    });
    await hookComponents(message);
  };

  const post = async (target: ReplyTarget) => {
    const message = await messenger.send(
      {
        embeds: [resolveLazy(messageContent)],
        components: renderPromptComponent(),
        ephemeral: ephemeral,
      },
      target
    );
    await hookComponents(message);
  };

  const repost = async (target: ReplyTarget, rerenderContent?: boolean) => {
    await removeComponentsFromSendMessages(rerenderContent);
    await post(target);
  };

  const removeComponentsFromSendMessages = async (rerenderContent?: boolean) => {
    const postedMessages = messenger.postedMessages();
    for (let i = 0; i < postedMessages.length; i++) {
      if (postedMessages[i].components.length === 0) continue;

      if (rerenderContent === true) {
        await messenger.editLatest({
          embeds: [resolveLazy(messageContent)],
          components: [],
        });
      } else {
        await messenger.editLatest({
          components: [],
        });
      }
    }
  };

  const close = async () => {
    await removeComponentsFromSendMessages();
  };

  //初回post
  setImmediate(() => {
    void post(rootTarget);
  });

  return {
    edit: edit,
    repost: repost,
    close: close,
  };
};
