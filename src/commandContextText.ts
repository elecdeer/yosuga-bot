import { CommandContext, ReplyType } from "./commandContext";
import { Guild, GuildMember, Message, MessageEmbed, TextChannel } from "discord.js";
import { YosugaClient } from "./yosugaClient";
import { getGuildConfig, GuildConfigWithoutVoice } from "./configManager";
import { Session } from "./session";

export type ValidMessage = Message & {
  guild: Guild;
  member: GuildMember;
  channel: TextChannel;
};

export const isValidMessage = (message: Message): message is ValidMessage =>
  !!message.guild && !message.author.bot && !!message.member && message.channel.isText();

export class CommandContextText extends CommandContext {
  override readonly guild: Guild;
  override readonly textChannel: TextChannel;
  override readonly member: GuildMember;
  override readonly config: GuildConfigWithoutVoice;
  override readonly session: Session | null;
  readonly message: Message;

  constructor(message: ValidMessage, yosuga: YosugaClient) {
    super();

    this.guild = message.guild;
    this.textChannel = message.channel;
    this.member = message.member;

    this.config = getGuildConfig(this.guild.id);
    const voiceChannel = this.member.voice.channel;
    this.session = voiceChannel ? yosuga.sessionManager.getSession(voiceChannel.id) : null;

    this.message = message;
  }

  override reply(
    type: ReplyType,
    content: string | MessageEmbed,
    channel?: Readonly<TextChannel>
  ): Promise<unknown> {
    const embed = this.constructEmbed(type, content);

    return (channel ?? this.textChannel).send({ embeds: [embed] });
  }

  getOptions(): undefined {
    return undefined;
  }
}
