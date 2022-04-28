import assert from "assert";
import {
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  MessageActionRow,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { getLogger } from "log4js";

import { CommandContext } from "./commandContext";
import { ConfigManager } from "./config/configManager";
import { Session } from "./session";
import { splitArrayPerNum } from "./util/arrayUtil";
import { constructEmbeds, ReplyType } from "./util/createEmbed";
import { allSerial } from "./util/promiseUtil";
import { YosugaClient } from "./yosugaClient";

const logger = getLogger("commandContextSlash");

export type ValidCommandInteraction = CommandInteraction<"cached"> & {
  guild: Guild;
  member: GuildMember;
  channel: TextChannel;
};

export const isValidCommandInteraction = (
  interaction: CommandInteraction
): interaction is ValidCommandInteraction => {
  return (
    interaction.inCachedGuild() &&
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

  readonly interaction: CommandInteraction<"cached">;

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

  override async reply({
    type = "plain",
    content,
    components,
    channel,
    ephemeral = false,
  }: {
    type?: ReplyType;
    content: string | MessageEmbed | MessageEmbed[];
    components?: MessageActionRow[];
    channel?: Readonly<TextChannel>;
    ephemeral?: boolean;
  }): Promise<Message<true>> {
    if (Array.isArray(content) && content.length > 10) {
      logger.error("10個以上のembedsを含む返信にはreplyMultiを使用する必要があります");
    }

    const embeds = constructEmbeds(type, content);
    if (channel) {
      const message = await channel.send({
        embeds: embeds,
        components: components,
      });
      assert(message.inGuild());
      return message;
    }

    if (this.interaction.deferred || this.interaction.replied) {
      return this.interaction.followUp({
        embeds: embeds,
        components: components,
        fetchReply: true,
        ephemeral: ephemeral,
      });
    } else {
      const message = await this.interaction.reply({
        embeds: embeds,
        components: components,
        fetchReply: true,
        ephemeral: ephemeral,
      });
      clearTimeout(this.differTimer);
      return message;
    }
  }

  override async replyMulti({
    type = "plain",
    content,
    channel,
    ephemeral,
  }: {
    type?: ReplyType;
    content: MessageEmbed[];
    channel?: Readonly<TextChannel>;
    ephemeral?: boolean;
  }): Promise<Message<true>[]> {
    const embeds = constructEmbeds(type, content);

    //embedは各Messageに10個まで
    const splitEmbeds = splitArrayPerNum(embeds, 10);

    const asyncProviders = splitEmbeds.map((embedsChunk) => {
      return () =>
        this.reply({
          type: type,
          content: embedsChunk,
          channel: channel,
          ephemeral: ephemeral,
        });
    });

    return allSerial(asyncProviders);
  }

  override getOptions(): CommandInteraction["options"] {
    return this.interaction.options;
  }
}
