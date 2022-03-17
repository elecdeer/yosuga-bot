import {
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { getLogger } from "log4js";

import { CommandContext } from "./commandContext";
import { ConfigManager } from "./config/configManager";
import { Session } from "./session";
import { splitArrayPerNum } from "./util/arrayUtil";
import { constructEmbeds, ReplyType } from "./util/createEmbed";
import { YosugaClient } from "./yosugaClient";

const logger = getLogger("commandContextSlash");

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
    content: string | MessageEmbed | MessageEmbed[],
    channel?: Readonly<TextChannel>
  ): Promise<Message[]> {
    const embeds = constructEmbeds(type, content);
    logger.debug(`embedsLength: ${embeds.length}`);

    //embedは各Messageに10個まで
    const splitEmbeds = splitArrayPerNum(embeds, 10);
    logger.debug(`splitNum: ${splitEmbeds.length}`);

    if (channel) {
      return Promise.all(
        splitEmbeds.map((embedsChunk) => {
          logger.debug(`chunkLength: ${embedsChunk.length}`);
          return channel.send({ embeds: embedsChunk });
        })
      );
    }

    if (!this.interaction.replied) {
      if (!this.interaction.deferred) {
        clearTimeout(this.differTimer);

        const [headEmbeds, ...restEmbeds] = splitEmbeds;

        //reply前
        const replyMessage = await this.interaction.reply({ embeds: headEmbeds, fetchReply: true });
        if (splitEmbeds.length <= 1) {
          //DMはそもそもない
          return [replyMessage] as Message[];
        } else {
          return [
            replyMessage,
            ...(await Promise.all(
              restEmbeds.map((embedsChunk) => {
                logger.debug(`chunkLength: ${embedsChunk.length}`);
                return this.interaction.followUp({ embeds: embedsChunk });
              })
            )),
          ] as Message[];
        }
      } else {
        return (await Promise.all(
          splitEmbeds.map((embedsChunk) => {
            logger.debug(`chunkLength: ${embedsChunk.length}`);
            return this.interaction.followUp({ embeds: embedsChunk });
          })
        )) as Message[];
      }
    } else {
      return Promise.all(
        splitEmbeds.map((embedsChunk) => {
          logger.debug(`chunkLength: ${embedsChunk.length}`);
          return this.textChannel.send({ embeds: embedsChunk });
        })
      );
    }
  }

  override getOptions(): CommandInteraction["options"] {
    return this.interaction.options;
  }
}
