import { MessageEmbed } from "discord.js";

export type ReplyType = "plain" | "warn" | "error" | "prohibit";
const REPLY_TYPE_EMOJI: Record<ReplyType, string> = {
  plain: "",
  error: "\u{2757}",
  prohibit: "\u{1F6AB}",
  warn: "\u{26A0}\u{FE0F}",
};

export type YosugaEmbedOption = {
  base?: MessageEmbed;
  message?: string;
  type?: ReplyType;
  isContinuation?: boolean;
};

export const createYosugaEmbed = ({
  base,
  message,
  type = "plain",
  isContinuation = false,
}: YosugaEmbedOption): MessageEmbed => {
  const embed = new MessageEmbed(base);
  embed.setColor(0xffb6c1);
  if (message) {
    embed.setDescription(type === "plain" ? message : `${REPLY_TYPE_EMOJI[type]} ${message}`);
  }
  if (!isContinuation) {
    embed.setAuthor({
      name: "Yosuga",
    });
  }

  return embed;
};

export const constructEmbeds = (
  type: ReplyType,
  content: string | MessageEmbed | MessageEmbed[]
): MessageEmbed[] => {
  if (typeof content === "string") {
    return [
      createYosugaEmbed({
        type: type,
        message: content,
      }),
    ];
  }

  if (Array.isArray(content)) {
    return content.map((item, index) =>
      createYosugaEmbed({
        type: type,
        base: item,
        isContinuation: index !== 0,
      })
    );
  }

  return [
    createYosugaEmbed({
      type: type,
      base: content,
    }),
  ];
};
