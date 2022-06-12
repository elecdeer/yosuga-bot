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

interface ReplyHelper {
  reply: (content: ReplyContent, target?: ReplyTarget) => Promise<Message>;
  postedMessages: readonly Message[];
}

export type ReplyTarget =
  | {
      type: "channel";
    }
  | {
      type: "message";
      target: Message;
    }
  | {
      type: "commandInteraction";
      target: BaseCommandInteraction<"cached">;
    }
  | {
      type: "messageComponentInteraction";
      target: MessageComponentInteraction<"cached">;
    };

type ReplyContent = {
  content?: string;
  embeds?: MessageEmbed[];
  components?: MessageActionRow[];
  attachments?: MessageAttachment[];
  ephemeral?: boolean;
  allowedMentions?: MessageMentionOptions;
};

type ReplyScene =
  | {
      type: "textChannel";
      channel: TextChannel;
    }
  | {
      type: "threadChannel";
      channel: ThreadChannel;
    }
  | {
      type: "newThread";
      channel: TextChannel;
      option: ThreadCreateOptions<AllowedThreadTypeForTextChannel>;
    }
  | {
      type: "dmChannel";
      channel: DMChannel;
    };

export const createReplyHelper = async (
  scene: ReplyScene,
  defaultContent?: ReplyContent
): Promise<ReplyHelper> => {
  const messages: Message[] = [];
  const initializedScene = await initializeScene(scene);

  return {
    reply: async (content, target = { type: "channel" }) => {
      const sendContent: ReplyContent = {
        ...defaultContent,
        ...content,
      };

      const message = await replyToDestination(initializedScene, target, sendContent);
      messages.push(message);
      return message;
    },
    postedMessages: messages,
  };
};

const initializeScene = async (
  scene: ReplyScene
): Promise<Exclude<ReplyScene, { type: "newThread" }>> => {
  if (scene.type === "newThread") {
    const thread = await scene.channel.threads.create(scene.option);
    return {
      type: "threadChannel",
      channel: thread,
    };
  }
  return scene;
};

const replyToDestination = (
  scene: Exclude<ReplyScene, { type: "newThread" }>,
  target: ReplyTarget,
  content: ReplyContent
): Promise<Message> => {
  const sendParam = {
    content: content.content,
    embeds: content.embeds,
    components: content.components,
    attachments: content.attachments,
    allowedMentions: content.allowedMentions,
    ephemeral: content.ephemeral,
  };

  if (scene.type === "textChannel" || scene.type === "dmChannel") {
    switch (target.type) {
      case "channel":
        return scene.channel.send(sendParam);
      case "message":
        return target.target.reply(sendParam);
      case "commandInteraction":
        return target.target.reply({
          ...sendParam,
          fetchReply: true,
        });
      case "messageComponentInteraction":
        return target.target.reply({
          ...sendParam,
          fetchReply: true,
        });
    }
  }
  if (scene.type === "threadChannel") {
    switch (target.type) {
      case "channel":
        return scene.channel.send(sendParam);
      case "message":
        return target.target.reply(sendParam);
      case "commandInteraction":
        return target.target.reply({
          ...sendParam,
          threadId: scene.channel.id,
          fetchReply: true,
        });
      case "messageComponentInteraction":
        return target.target.reply({
          ...sendParam,
          threadId: scene.channel.id,
          fetchReply: true,
        });
    }
  }
  throw new Error("unreachable");
};
