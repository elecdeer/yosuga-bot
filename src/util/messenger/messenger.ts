import type {
  Message,
  MessageOptions,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
} from "discord.js";

export interface Messenger {
  send: (param: MessageParam, target?: ReplyTarget) => Promise<Message>;
  editLatest: (param: MessageParam) => Promise<Message>;
  edit: (param: MessageParam, message: Message) => Promise<Message>;
  postedMessages: () => readonly Message[];
}

export type MessageParam = Pick<
  MessageOptions,
  "content" | "embeds" | "components" | "allowedMentions" | "stickers" | "attachments"
> & {
  /**
   * interactionへの返答にのみ適用される
   */
  ephemeral?: boolean;
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
