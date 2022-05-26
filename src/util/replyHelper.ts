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
  reply: (param: ReplyParam) => Promise<Message>;
  changeDestination: (destination: ReplyDestination) => void;
  postedMessages: Message[];
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

  const messages: Message[] = [];

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

const replyToDestination = (
  root: ReplyDestination,
  param: Omit<ReplyParam, "transferRoot">
): Promise<Message> => {
  switch (root.type) {
    case "textChannel":
      return root.destination.send({
        content: param.content,
        embeds: param.embeds,
        components: param.components,
        attachments: param.attachments,
        allowedMentions: param.allowedMentions,
      });
    case "message":
      return root.destination.reply({
        content: param.content,
        embeds: param.embeds,
        components: param.components,
        attachments: param.attachments,
        allowedMentions: param.allowedMentions,
      });
    case "commandInteraction":
      return root.destination.reply({
        content: param.content,
        embeds: param.embeds,
        components: param.components,
        attachments: param.attachments,
        allowedMentions: param.allowedMentions,
        fetchReply: true,
      });
    case "messageComponentInteraction":
      return root.destination.reply({
        content: param.content,
        embeds: param.embeds,
        components: param.components,
        attachments: param.attachments,
        allowedMentions: param.allowedMentions,
        fetchReply: true,
      });
  }
};
