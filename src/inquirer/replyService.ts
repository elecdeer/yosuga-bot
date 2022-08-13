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
>;

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
      option: ThreadCreateOptions<AllowedThreadTypeForTextChannel>;
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

export const replyService = (scene: ReplyScene): ReplyHelper => {
  const history: ReplyHistory[] = [];

  const reply = replyToTarget(scene);

  return {
    reply: async (param: ReplyParam, target: ReplyTarget = { type: "channel" }) => {
      const message = await reply(param, target);
      history.push({ message, target });
      return message;
    },
    edit: async (param, index) => {
      const historyItem = history.at(index ?? -1);
      if (historyItem === undefined) {
        throw new Error("送信済みのMessageが存在しません");
      }

      return await editHistory(historyItem)(param);
    },
    postedMessages: () => history.map((item) => item.message),
  };
};

const replyToTarget = (scene: ReplyScene) => {
  const getThreadIdParam = async () => {
    //newThreadの場合は初回にスレッドを作成する
    if (scene.type === "newThread") {
      const thread = await scene.channel.threads.create(scene.option);
      scene = {
        type: "threadChannel",
        channel: thread,
      };
      return {
        threadId: thread.id,
      };
    }
    if (scene.type === "threadChannel") {
      return {
        threadId: scene.channel.id,
      };
    }
    return {};
  };

  return async (param: ReplyParam, target: ReplyTarget) => {
    switch (target.type) {
      case "channel":
        return scene.channel.send(param);
      case "message":
        return target.message.reply(param);
      case "commandInteraction":
      case "messageComponentInteraction":
        return await target.interaction.reply({
          ...param,
          fetchReply: true,
          ...(await getThreadIdParam()),
        });
      default:
        throw new Error("target.typeが不正です");
    }
  };
};

const editHistory = (historyItem: ReplyHistory) => {
  return async (editParam: ReplyParam) => {
    if (
      historyItem.target.type === "commandInteraction" ||
      historyItem.target.type === "messageComponentInteraction"
    ) {
      return await historyItem.target.interaction.editReply(editParam);
    }

    return await historyItem.message.edit(editParam);
  };
};
