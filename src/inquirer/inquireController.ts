import { resolveLazy } from "../util/lazy";
import { createReplyHelper } from "../util/replyHelpter";
import { renderComponents } from "./renderComponents";

import type { ReplyTarget } from "../util/replyHelpter";
import type { Prompt, PromptController, PromptParamMessage } from "./promptTypes";
import type { Awaitable, Collection, Message } from "discord.js";

export const createInquireController = async (
  promptCollection: Collection<string, Prompt<unknown>>,
  { scene, rootTarget, ephemeral, messageContent }: PromptParamMessage
): Promise<PromptController> => {
  const replyHelper = await createReplyHelper(scene);
  let hooksCleaner: (() => Awaitable<void>)[] = [];
  const cleanHooks = async () => {
    await Promise.all(hooksCleaner.map((item) => item()));
  };

  const hookComponents = async (message: Message) => {
    await cleanHooks();

    hooksCleaner = await Promise.all(promptCollection.map((prompt) => prompt.hookMessage(message)));
  };

  const renderer = renderComponents;
  const renderPromptComponent = () =>
    renderer(promptCollection.map((prompt) => prompt.getComponent()).flat());

  const edit = async () => {
    const message = await replyHelper.edit({
      components: renderPromptComponent(),
    });
    await hookComponents(message);
  };

  const post = async (target: ReplyTarget) => {
    const message = await replyHelper.reply(
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
    const postedMessages = replyHelper.postedMessages();
    for (let i = 0; i < postedMessages.length; i++) {
      if (postedMessages[i].components.length === 0) continue;

      if (rerenderContent === true) {
        await replyHelper.edit({
          embeds: [resolveLazy(messageContent)],
          components: [],
        });
      } else {
        await replyHelper.edit({
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
