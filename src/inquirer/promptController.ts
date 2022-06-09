import { resolveLazy } from "../util/lazy";
import { createReplyHelper } from "../util/replyHelper";

import type { ReplyDestination } from "../util/replyHelper";
import type { TypedEventEmitter } from "../util/typedEventEmitter";
import type { PromptComponent, PromptController, PromptEvent, PromptParam } from "./promptTypes";
import type { Awaitable, Collection, Message } from "discord.js";

export const createPromptController = async <T extends Record<string, PromptComponent<unknown>>>(
  componentCollection: Collection<keyof T, T[keyof T]>,
  event: TypedEventEmitter<PromptEvent<T>>,
  replyDestination: ReplyDestination,
  param: PromptParam
): Promise<PromptController> => {
  const replyHelper = createReplyHelper(replyDestination, {});

  const renderActionRows = () => {
    return componentCollection.map((item) => item.renderComponent()).flat();
  };

  let hooksCleaner: (() => Awaitable<void>)[];
  const hookComponents = async (message: Message) => {
    if (hooksCleaner) {
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

  const post = async (destination?: ReplyDestination) => {
    const actionRows = renderActionRows();

    if (destination) {
      replyHelper.changeDestination(destination);
    }

    const message = await replyHelper.reply({
      embeds: [resolveLazy(param.messageContent)],
      components: actionRows,
      ephemeral: param.ephemeral,
    });

    await hookComponents(message);
  };

  //これまでに送ったMessageからcomponentsを削除
  const removeComponentsFromSendMessages = async (rerender?: boolean) => {
    await Promise.all(
      replyHelper.postedMessages
        .filter((msg) => msg.components.length > 0)
        .map(async (msg) => {
          await msg.edit(
            rerender
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

    const lastMessage = replyHelper.postedMessages.at(-1);
    if (!lastMessage) {
      return;
    }
    const editMessage = await lastMessage.edit({
      embeds: [resolveLazy(param.messageContent)],
      components: actionRows,
    });

    await hookComponents(editMessage);
  };

  const repost = async (destination: ReplyDestination, rerender?: boolean) => {
    await removeComponentsFromSendMessages(rerender);
    await post(destination);
  };

  //初回post
  //コンポーネントのlazyでpromptの返り値を使えるようにするため、lazyの解決をpromptが返った後にする
  setImmediate(() => {
    void post(replyDestination);
  });

  const controller = {
    repost,
    edit,
    close,
  };

  return controller;
};
