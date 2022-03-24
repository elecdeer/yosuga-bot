import {
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  MessageEmbed,
  TextChannel,
} from "discord.js";

import { UnifiedConfigAccessor } from "./config/accessor/unifiedConfigAccessor";
import { ConfigManager } from "./config/configManager";
import { Session } from "./session";
import { ReplyType } from "./util/createEmbed";
import { YosugaClient } from "./yosugaClient";

export abstract class CommandContext {
  abstract readonly yosuga: YosugaClient;
  abstract readonly session: Session | null;
  abstract readonly configManager: ConfigManager;
  abstract readonly guild: Guild;
  abstract readonly member: GuildMember;
  abstract readonly textChannel: TextChannel;

  abstract reply(
    type: ReplyType,
    content: string | MessageEmbed | MessageEmbed[],
    channel?: Readonly<TextChannel>
  ): Promise<Message[]>;

  abstract getOptions(): CommandInteraction["options"] | undefined;

  getUnifiedConfigAccessor(): UnifiedConfigAccessor {
    return this.configManager.getUnifiedConfigAccessor(this.guild.id, this.member.id);
  }
}
