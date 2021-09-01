import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  Guild,
  GuildMember,
  MessageEmbed,
  TextChannel,
} from "discord.js";

import { CommandContext, ReplyType } from "./commandContext";
import { UnifiedConfig } from "./configManager";
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
  override readonly guild: Guild;
  override readonly textChannel: TextChannel;
  override readonly member: GuildMember;
  override readonly config: Promise<UnifiedConfig>;
  override readonly session: Session | null;

  readonly interaction: CommandInteraction;

  private readonly differTimer: NodeJS.Timeout;

  constructor(interaction: ValidCommandInteraction, yosuga: YosugaClient) {
    super();

    this.guild = interaction.guild;
    this.textChannel = interaction.channel;
    this.member = interaction.member;

    this.config = yosuga.configManager.getUnifiedConfig(this.guild.id);
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

  override reply(
    type: ReplyType,
    content: string | MessageEmbed,
    channel?: Readonly<TextChannel>
  ): Promise<unknown> {
    const embed = this.constructEmbed(type, content);

    if (channel) {
      return channel.send({ embeds: [embed] });
    }

    if (!this.interaction.replied) {
      if (!this.interaction.deferred) {
        clearTimeout(this.differTimer);
        return this.interaction.reply({ embeds: [embed] });
      } else {
        return this.interaction.followUp({ embeds: [embed] });
      }
    } else {
      return this.textChannel.send({ embeds: [embed] });
    }
  }

  override getOptions(): CommandInteractionOptionResolver {
    return this.interaction.options;
  }
}
