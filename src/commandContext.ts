import {
  CommandInteractionOptionResolver,
  Guild,
  GuildMember,
  MessageEmbed,
  TextChannel,
} from "discord.js";

import { GuildConfigWithoutVoice } from "./configManager";
import { Session } from "./session";
import { createYosugaEmbed } from "./util";

export type ReplyType = "plain" | "warn" | "error" | "prohibit";
const REPLY_TYPE_EMOJI: Record<ReplyType, string> = {
  plain: "",
  error: "\u{2757}",
  prohibit: "\u{1F6AB}",
  warn: "\u{26A0}\u{FE0F}",
};

export abstract class CommandContext {
  abstract readonly session: Session | null;
  abstract readonly config: GuildConfigWithoutVoice;
  abstract readonly guild: Guild;
  abstract readonly member: GuildMember;
  abstract readonly textChannel: TextChannel;

  abstract reply(
    type: ReplyType,
    content: string | MessageEmbed,
    channel?: Readonly<TextChannel>
  ): Promise<unknown>;

  protected constructEmbed(type: ReplyType, content: string | MessageEmbed): MessageEmbed {
    const prefix = REPLY_TYPE_EMOJI[type];
    if (typeof content === "string") {
      return createYosugaEmbed().setDescription(`${prefix} ${content}`);
    } else {
      const embed = createYosugaEmbed(content);
      return embed.setDescription(`${prefix} ${embed.description}`);
    }
  }

  abstract getOptions(): CommandInteractionOptionResolver | undefined;
}
