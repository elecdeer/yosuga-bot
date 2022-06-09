import type {
  BaseCommandInteraction,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageComponentInteraction,
  MessageEmbed,
  MessageMentionOptions,
  TextChannel,
  ThreadChannel,
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
      type: "thread";
      destination: ThreadChannel;
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
  const sendParam = {
    content: param.content,
    embeds: param.embeds,
    components: param.components,
    attachments: param.attachments,
    allowedMentions: param.allowedMentions,
  };
  switch (root.type) {
    case "textChannel":
      return root.destination.send(sendParam);
    case "thread":
      return root.destination.send(sendParam);
    case "message":
      return root.destination.reply(sendParam);
    case "commandInteraction":
      return root.destination.reply({
        ...sendParam,
        fetchReply: true,
      });
    case "messageComponentInteraction":
      return root.destination.reply({
        ...sendParam,
        fetchReply: true,
      });
  }
};
