import { getLogger } from "log4js";

import { resolveLazy } from "./lazy";

import type { Lazy } from "./lazy";
import type {
  AllowedThreadTypeForTextChannel,
  ChatInputCommandInteraction,
  DMChannel,
  Message,
  MessageComponentInteraction,
  MessageOptions,
  TextChannel,
  ThreadChannel,
  ThreadCreateOptions,
} from "discord.js";

export interface ReplyHelper {
  reply: (param: ReplyParam, target?: ReplyTarget) => Promise<Message>;
  postedMessages: () => readonly Message[];
  edit: (param: ReplyParam, index?: number) => Promise<Message>;
}

export type ReplyParam = Pick<
  MessageOptions,
  "content" | "embeds" | "components" | "allowedMentions" | "stickers" | "attachments"
> & {
  /**
   * interactionへの返答にのみ適用される
   */
  ephemeral?: boolean;
};

export type ReplyScene =
  | {
      type: "textChannel";
      channel: TextChannel;
    }
  | {
      type: "threadChannel";
      channel: ThreadChannel;
    }
  | {
      type: "dmChannel";
      channel: DMChannel;
    }
  | {
      type: "newThread";
      channel: TextChannel;
      option: Omit<ThreadCreateOptions<AllowedThreadTypeForTextChannel>, "startMessage"> & {
        startMessageParam: Lazy<ReplyParam, ThreadChannel | null>;
      };
    };

export type ReplyTarget =
  | {
      type: "channel";
    }
  | {
      type: "message";
      message: Message;
    }
  | {
      type: "commandInteraction";
      interaction: ChatInputCommandInteraction<"cached">;
    }
  | {
      type: "messageComponentInteraction";
      interaction: MessageComponentInteraction<"cached">;
    };

type ReplyHistory = {
  message: Message;
  target: ReplyTarget;
};

const logger = getLogger("replyHelper");

export const createReplyHelper = (scene: ReplyScene): ReplyHelper => {
  const history: ReplyHistory[] = [];

  const reply = replyToTarget(scene);

  return {
    reply: async (param: ReplyParam, target: ReplyTarget = { type: "channel" }) => {
      const message = await reply(param, target);
      history.push({ message, target });
      logger.trace(`pushMessage: ${message.id}`);
      return message;
    },
    edit: async (param, index) => {
      const historyItem = history.at(index ?? -1);
      logger.trace(`editMessage: ${historyItem?.message.id}`);
      if (historyItem === undefined) {
        throw new Error("送信済みのMessageが存在しません");
      }

      return await editHistory(historyItem)(param);
    },
    postedMessages: () => history.map((item) => item.message),
  };
};

const replyToTarget = (scene: ReplyScene) => {
  const getThreadIdParam = () => {
    if (scene.type === "threadChannel") {
      logger.trace("threadChannel", scene.channel.id);
      return {
        threadId: scene.channel.id,
      };
    }
    return {};
  };

  const createMessage = async (param: ReplyParam, target: ReplyTarget): Promise<Message> => {
    // await createThread();
    if (target.type === "channel") {
      return scene.channel.send(param);
    }
    if (target.type === "message") {
      return target.message.reply({
        ...param,
      });
    }
    if (target.type === "commandInteraction" || target.type === "messageComponentInteraction") {
      if (!target.interaction.replied) {
        return await target.interaction.reply({
          ...param,
          fetchReply: true,
          ...getThreadIdParam(),
        });
      } else {
        return await target.interaction.followUp({
          ...param,
          fetchReply: true,
          ...getThreadIdParam(),
        });
      }
    }
    throw new Error("target.typeが不正です");
  };

  return async (param: ReplyParam, target: ReplyTarget) => {
    if (scene.type === "newThread") {
      const msg = await createMessage(resolveLazy(scene.option.startMessageParam, null), target);
      const thread = await msg.startThread(scene.option);
      await msg.edit(resolveLazy(scene.option.startMessageParam, thread));
      scene = {
        type: "threadChannel",
        channel: thread,
      };
      return await createMessage(param, {
        type: "channel",
      });
    } else {
      return await createMessage(param, target);
    }
  };
};

const editHistory = (historyItem: ReplyHistory) => {
  return async (editParam: ReplyParam) => {
    // if (
    //   historyItem.target.type === "commandInteraction" ||
    //   historyItem.target.type === "messageComponentInteraction"
    // ) {
    //   return await historyItem.target.interaction.editReply(editParam);
    // }

    return await historyItem.message.edit(editParam);
  };
};
