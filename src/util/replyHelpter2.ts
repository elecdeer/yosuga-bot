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
  ThreadCreateOptions,
} from "discord.js";

export interface ReplyHelper {
  reply: (param: ReplyParam, target?: ReplyTarget) => Promise<Message>;
  postedMessages: readonly Message[];
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
      interaction: BaseCommandInteraction<"cached">;
    }
  | {
      type: "messageComponentInteraction";
      interaction: MessageComponentInteraction<"cached">;
    };

export const createReplyHelper = async (scene: ReplyScene): Promise<ReplyHelper> => {
  if (scene.type === "newThread") {
    const thread = await scene.channel.threads.create(scene.option);

    scene = {
      type: "threadChannel",
      channel: thread,
    };
  }

  const messages: Message[] = [];

  const reply = async (param: ReplyParam, target: ReplyTarget) => {
    const sendParam = {
      content: param.content,
      embeds: param.embeds,
      components: param.components,
      attachments: param.attachments,
      allowedMentions: param.allowedMentions,
      ephemeral: param.ephemeral,
    };

    if (target.type === "channel") {
      return await scene.channel.send(sendParam);
    }

    if (target.type === "message") {
      return await target.message.reply(sendParam);
    }

    if (target.type === "commandInteraction" || target.type === "messageComponentInteraction") {
      const threadIdParam = scene.type === "threadChannel" ? { threadId: scene.channel.id } : {};
      return await target.interaction.reply({
        ...sendParam,
        fetchReply: true,
        ...threadIdParam,
      });
    }

    throw new Error("target.typeが不正です");
  };
  return {
    reply: async (param, target) => {
      const message = await reply(param, target ?? { type: "channel" });
      messages.push(message);
      return message;
    },
    postedMessages: messages,
  };
};
