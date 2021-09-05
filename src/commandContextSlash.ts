import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  Guild,
  GuildMember,
  Message,
  MessageEmbed,
  TextChannel,
} from "discord.js";

import { CommandContext, ReplyType } from "./commandContext";
import { ConfigManager } from "./configManager";
import { Session } from "./session";
import { YosugaClient } from "./yosugaClient";

export type ValidCommandInteraction = CommandInteraction & {
  guild: Guild;
  member: GuildMember;
  channel: TextChannel;
};

export const isValidCommandInteraction = (
  interaction: CommandInteraction
): interaction is ValidCommandInteraction => {
  return (
    !!interaction.guild &&
    !!interaction.member &&
    !!interaction.channel &&
    interaction.isCommand() &&
    interaction.channel.isText()
  );
};

export class CommandContextSlash extends CommandContext {
  override readonly yosuga: YosugaClient;
  override readonly guild: Guild;
  override readonly textChannel: TextChannel;
  override readonly session: Session | null;
  override readonly configManager: ConfigManager;
  override readonly member: GuildMember;

  readonly interaction: CommandInteraction;

  private readonly differTimer: NodeJS.Timeout;

  constructor(interaction: ValidCommandInteraction, yosuga: YosugaClient) {
    super();

    this.yosuga = yosuga;
    this.guild = interaction.guild;
    this.textChannel = interaction.channel;
    this.member = interaction.member;

    this.configManager = yosuga.configManager;
    const voiceChannel = this.member.voice.channel;
    this.session = voiceChannel ? yosuga.sessionManager.getSession(this.guild.id) : null;

    this.interaction = interaction;

    this.differTimer = setTimeout(() => {
      if (this.interaction.replied || this.interaction.deferred) {
        return;
      }
      void this.interaction.deferReply();
    }, 2500);
  }

  override async reply(
    type: ReplyType,
    content: string | MessageEmbed,
    channel?: Readonly<TextChannel>
  ): Promise<Message> {
    const embed = this.constructEmbed(type, content);

    if (channel) {
      return channel.send({ embeds: [embed] });
    }

    if (!this.interaction.replied) {
      if (!this.interaction.deferred) {
        clearTimeout(this.differTimer);
        const message = await this.interaction.reply({ embeds: [embed], fetchReply: true });
        //DMはそもそもない
        return message as Message;
      } else {
        const message = await this.interaction.followUp({ embeds: [embed] });
        //DMはそもそもない
        return message as Message;
      }
    } else {
      return this.textChannel.send({ embeds: [embed] });
    }
  }

  override getOptions(): CommandInteractionOptionResolver {
    return this.interaction.options;
  }
}
