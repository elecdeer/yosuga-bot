import { resolveLazy } from "../util/lazy";
import { createReplyHelper } from "../util/replyHelpter2";

import type { ReplyTarget } from "../util/replyHelpter2";
import type { TypedEventEmitter } from "../util/typedEventEmitter";
import type { PromptComponent, PromptController, PromptEvent, PromptParam } from "./promptTypes";
import type { Awaitable, Collection, Message } from "discord.js";

export const createPromptController = async <T extends Record<string, PromptComponent<unknown>>>(
  componentCollection: Collection<keyof T, T[keyof T]>,
  event: TypedEventEmitter<PromptEvent<T>>,
  param: PromptParam
): Promise<PromptController> => {
  const replyHelper = await createReplyHelper(param.scene);

  const renderActionRows = () => {
    return componentCollection.map((item) => item.renderComponent()).flat();
  };

  let hooksCleaner: (() => Awaitable<void>)[];
  const hookComponents = async (message: Message) => {
    if (hooksCleaner !== undefined) {
      await Promise.all(hooksCleaner.map((item) => item()));
    }
    hooksCleaner = componentCollection
      .map((com, key) => {
        return com.hook({
          message: message,
          promptParam: param,
          updateCallback: () => {
            event.emit("update", {
              key: key,
              status: com.getStatus() as PromptEvent<T>["update"]["status"],
            });
          },
          controller: controller,
        });
      })
      .filter((item) => !!item) as (() => Awaitable<void>)[];
  };

  const post = async (target?: ReplyTarget) => {
    const actionRows = renderActionRows();

    const message = await replyHelper.reply(
      {
        embeds: [resolveLazy(param.messageContent)],
        components: actionRows,
        ephemeral: param.ephemeral,
      },
      target
    );

    await hookComponents(message);
  };

  //これまでに送ったMessageからcomponentsを削除
  const removeComponentsFromSendMessages = async (rerender?: boolean) => {
    await Promise.all(
      replyHelper
        .postedMessages()
        .filter((msg) => msg.components.length > 0)
        .map(async (msg) => {
          await msg.edit(
            rerender === true
              ? {
                  embeds: [resolveLazy(param.messageContent)],
                  components: [],
                }
              : {
                  components: [],
                }
          );
        })
    );
  };

  const close = async (rerender?: boolean) => {
    await removeComponentsFromSendMessages(rerender);

    event.emit("close", {});
  };

  const edit = async () => {
    const actionRows = renderActionRows();

    const editMessage = await replyHelper.edit({
      embeds: [resolveLazy(param.messageContent)],
      components: actionRows,
    });

    await hookComponents(editMessage);
  };

  const repost = async (target: ReplyTarget, rerender?: boolean) => {
    await removeComponentsFromSendMessages(rerender);
    await post(target);
  };

  //初回post
  //コンポーネントのlazyでpromptの返り値を使えるようにするため、lazyの解決をpromptが返った後にする
  setImmediate(() => {
    void post(param.rootTarget);
  });

  const controller = {
    repost,
    edit,
    close,
  };

  return controller;
};
