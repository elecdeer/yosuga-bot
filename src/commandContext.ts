import {
  CommandInteractionOptionResolver,
  Guild,
  GuildMember,
  Message,
  MessageEmbed,
  TextChannel,
} from "discord.js";

import { ConfigManager } from "./config/configManager";
import { UnifiedConfigAccessor } from "./config/unifiedConfigAccessor";
import { Session } from "./session";
import { createYosugaEmbed } from "./util/util";
import { YosugaClient } from "./yosugaClient";

export type ReplyType = "plain" | "warn" | "error" | "prohibit";
const REPLY_TYPE_EMOJI: Record<ReplyType, string> = {
  plain: "",
  error: "\u{2757}",
  prohibit: "\u{1F6AB}",
  warn: "\u{26A0}\u{FE0F}",
};

export abstract class CommandContext {
  abstract readonly yosuga: YosugaClient;
  abstract readonly session: Session | null;
  abstract readonly configManager: ConfigManager;
  abstract readonly guild: Guild;
  abstract readonly member: GuildMember;
  abstract readonly textChannel: TextChannel;

  abstract reply(
    type: ReplyType,
    content: string | MessageEmbed,
    channel?: Readonly<TextChannel>
  ): Promise<Message>;

  abstract getOptions(): CommandInteractionOptionResolver | undefined;

  getUnifiedConfigAccessor(): UnifiedConfigAccessor {
    return this.configManager.getUnifiedConfigAccessor(this.guild.id, this.member.id);
  }

  constructEmbed(type: ReplyType, content: string | MessageEmbed): MessageEmbed {
    const prefix = REPLY_TYPE_EMOJI[type];
    if (typeof content === "string") {
      return createYosugaEmbed().setDescription(`${prefix} ${content}`);
    } else {
      const embed = createYosugaEmbed(content);
      return embed.setDescription(`${prefix} ${embed.description}`);
    }
  }
}
