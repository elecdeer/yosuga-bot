import type {
  AllowedThreadTypeForTextChannel,
  BaseCommandInteraction,
  DMChannel,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageComponentInteraction,
  MessageEmbed,
  MessageMentionOptions,
  TextChannel,
  ThreadChannel,
  GuildTextThreadCreateOptions,
} from "discord.js";

export interface ReplyHelper {
  reply: (param: ReplyParam, target?: ReplyTarget) => Promise<Message>;
  postedMessages: () => readonly Message[];
  edit: (param: ReplyParam, index?: number) => Promise<Message>;
}

export type ReplyParam = {
  content?: string;
  embeds?: MessageEmbed[];
  components?: MessageActionRow[];
  attachments?: MessageAttachment[];
  ephemeral?: boolean;
  allowedMentions?: MessageMentionOptions;
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
      option: GuildTextThreadCreateOptions<AllowedThreadTypeForTextChannel>;
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
      interaction: BaseCommandInteraction<"cached">;
    }
  | {
      type: "messageComponentInteraction";
      interaction: MessageComponentInteraction<"cached">;
    };

type ReplyHistory = {
  message: Message;
  target: ReplyTarget;
};

const replyToTarget = (
  scene: Exclude<
    ReplyScene,
    {
      type: "newThread";
    }
  >
) => {
  return async (param: ReplyParam, target: ReplyTarget) => {
    if (target.type === "channel") {
      return await scene.channel.send(param);
    }

    if (target.type === "message") {
      return await target.message.reply(param);
    }

    if (target.type === "commandInteraction" || target.type === "messageComponentInteraction") {
      const threadIdParam = scene.type === "threadChannel" ? { threadId: scene.channel.id } : {};
      return await target.interaction.reply({
        ...param,
        fetchReply: true,
        ...threadIdParam,
      });
    }

    throw new Error("target.typeが不正です");
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

export const createReplyHelper = async (scene: ReplyScene): Promise<ReplyHelper> => {
  if (scene.type === "newThread") {
    const thread = await scene.channel.threads.create(scene.option);

    scene = {
      type: "threadChannel",
      channel: thread,
    };
  }

  const history: ReplyHistory[] = [];

  const reply = replyToTarget(scene);

  return {
    reply: async (param, target = { type: "channel" }) => {
      const message = await reply(param, target);
      history.push({
        message: message,
        target: target,
      });
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
