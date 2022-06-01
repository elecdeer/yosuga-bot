import {
  BaseCommandInteraction,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageComponentInteraction,
  MessageEmbed,
  MessageMentionOptions,
  TextChannel,
} from "discord.js";

interface ReplyHelper {
  reply: (param: ReplyParam) => Promise<Message<true>>;
  changeDestination: (destination: ReplyDestination) => void;
  postedMessages: Message<true>[];
}

type ReplyParam = {
  content?: string;
  embeds?: MessageEmbed[];
  components?: MessageActionRow[];
  attachments?: MessageAttachment[];
  ephemeral?: boolean;
  allowedMentions?: MessageMentionOptions;
  transferRoot?: boolean;
};

export type ReplyDestination =
  | {
      type: "textChannel";
      destination: TextChannel;
    }
  | {
      type: "message";
      destination: Message;
    }
  | {
      type: "commandInteraction";
      destination: BaseCommandInteraction<"cached">;
    }
  | {
      type: "messageComponentInteraction";
      destination: MessageComponentInteraction<"cached">;
    };

export const createReplyHelper = (
  root: ReplyDestination,
  defaultParam: ReplyParam
): ReplyHelper => {
  let replyRoot: ReplyDestination = root;

  const messages: Message<true>[] = [];

  return {
    reply: async (param) => {
      const applyParam = {
        ...defaultParam,
        ...param,
      };

      const message = await replyToDestination(replyRoot, applyParam);
      if (param.transferRoot) {
        replyRoot = {
          type: "message",
          destination: message,
        };
      }
      messages.push(message);
      return message;
    },
    changeDestination: (destination: ReplyDestination) => {
      replyRoot = destination;
    },
    postedMessages: messages,
  };
};

const replyToDestination = async (
  root: ReplyDestination,
  param: Omit<ReplyParam, "transferRoot">
): Promise<Message<true>> => {
  if (root.type === "textChannel") {
    const message = await root.destination.send({
      content: param.content,
      embeds: param.embeds,
      components: param.components,
      attachments: param.attachments,
      allowedMentions: param.allowedMentions,
    });
    if (!message.inGuild()) throw new Error("Guild外のTextChannelは指定できません");
    return message;
  } else if (root.type === "message") {
    const message = await root.destination.reply({
      content: param.content,
      embeds: param.embeds,
      components: param.components,
      attachments: param.attachments,
      allowedMentions: param.allowedMentions,
    });
    if (!message.inGuild()) throw new Error("Guild外のMessageは指定できません");
    return message;
  } else if (root.type === "commandInteraction") {
    return root.destination.reply({
      content: param.content,
      embeds: param.embeds,
      components: param.components,
      attachments: param.attachments,
      allowedMentions: param.allowedMentions,
      fetchReply: true,
    });
  } else if (root.type === "messageComponentInteraction") {
    return root.destination.reply({
      content: param.content,
      embeds: param.embeds,
      components: param.components,
      attachments: param.attachments,
      allowedMentions: param.allowedMentions,
      fetchReply: true,
    });
  }

  throw new Error("到達不能");
};
