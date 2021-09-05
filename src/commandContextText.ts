import { Guild, GuildMember, Message, MessageEmbed, TextChannel } from "discord.js";

import { CommandContext, ReplyType } from "./commandContext";
import { ConfigManager } from "./configManager";
import { Session } from "./session";
import { YosugaClient } from "./yosugaClient";

export type ValidMessage = Message & {
  guild: Guild;
  member: GuildMember;
  channel: TextChannel;
};

export const isValidMessage = (message: Message): message is ValidMessage =>
  !!message.guild && !message.author.bot && !!message.member && message.channel.isText();

export class CommandContextText extends CommandContext {
  override readonly yosuga: YosugaClient;
  override readonly guild: Guild;
  override readonly textChannel: TextChannel;
  override readonly member: GuildMember;
  override readonly configManager: ConfigManager;
  override readonly session: Session | null;
  readonly message: Message;

  constructor(message: ValidMessage, yosuga: YosugaClient) {
    super();

    this.yosuga = yosuga;
    this.guild = message.guild;
    this.textChannel = message.channel;
    this.member = message.member;

    this.configManager = yosuga.configManager;
    const voiceChannel = this.member.voice.channel;
    this.session = voiceChannel ? yosuga.sessionManager.getSession(this.guild.id) : null;

    this.message = message;
  }

  override reply(
    type: ReplyType,
    content: string | MessageEmbed,
    channel?: Readonly<TextChannel>
  ): Promise<Message> {
    const embed = this.constructEmbed(type, content);

    return (channel ?? this.textChannel).send({ embeds: [embed] });
  }

  getOptions(): undefined {
    return undefined;
  }
}
