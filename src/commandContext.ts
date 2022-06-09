import type { UnifiedConfigAccessor } from "./config/accessor/unifiedConfigAccessor";
import type { ConfigManager } from "./config/configManager";
import type { Session } from "./session";
import type { ReplyType } from "./util/createEmbed";
import type { YosugaClient } from "./yosugaClient";
import type {
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  MessageActionRow,
  MessageEmbed,
  TextChannel,
} from "discord.js";

export abstract class CommandContext {
  abstract readonly yosuga: YosugaClient;
  abstract readonly session: Session | null;
  abstract readonly configManager: ConfigManager;
  abstract readonly guild: Guild;
  abstract readonly member: GuildMember;
  abstract readonly textChannel: TextChannel;

  abstract reply(props: {
    type?: ReplyType;
    content: string | MessageEmbed | MessageEmbed[];
    component?: MessageActionRow[];
    channel?: Readonly<TextChannel>;
  }): Promise<Message>;

  abstract replyMulti(props: {
    type?: ReplyType;
    content: MessageEmbed[];
    channel?: Readonly<TextChannel>;
  }): Promise<Message[]>;

  abstract getOptions(): CommandInteraction["options"] | undefined;

  getUnifiedConfigAccessor(): UnifiedConfigAccessor {
    return this.configManager.getUnifiedConfigAccessor(this.guild.id, this.member.id);
  }
}
