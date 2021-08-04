import EventEmitter from "events";
import { Client, GuildMember, Message, TextChannel } from "discord.js";
import StrictEventEmitter from "strict-event-emitter-types";

import log4js from "log4js";
import { getGuildConfig } from "./configManager";
import { CommandContext, VoiceOrStageChannel } from "./types";
import { getSession } from "./sessionManager";

//TODO yosugaEventEmitterはeventEmitterBaseに改名して、indexでやってるassignCommandsとかをコンストラクタでやるように

const logger = log4js.getLogger("yosugaEvent");

interface Events {
  command: (cmd: string, args: string[], context: CommandContext) => Promise<void>;
  message: (guildId: string, message: Message) => void;
  moveChannel: (
    guildId: string,
    member: GuildMember,
    from: VoiceOrStageChannel | null,
    to: VoiceOrStageChannel | null
  ) => void;
  turnOnVideo: (guildId: string, member: GuildMember) => void;
  turnOffVideo: (guildId: string, member: GuildMember) => void;
  turnOnGoLive: (guildId: string, member: GuildMember) => void;
  turnOffGoLive: (guildId: string, member: GuildMember) => void;
  destroy: () => void;
}

type YosugaEmitter = StrictEventEmitter<EventEmitter, Events>;

export class YosugaEventEmitter extends (EventEmitter as { new (): YosugaEmitter }) {
  constructor(client: Client) {
    super();

    client.once("ready", () => {
      logger.info("bot ready");
    });

    client.on("message", (message) => {
      logger.debug("handle message");
      if (!message.guild) return;
      if (message.author.bot) return;
      if (!message.member) return;
      if (!message.channel.isText()) return;

      const guildId = message.guild.id;
      const config = getGuildConfig(guildId);

      const messageSlice = message.content.trim().split(" ");
      const prefix = messageSlice.shift() ?? "";
      const command = messageSlice.shift() ?? "";

      // const session = getSession(guildId);

      logger.debug(`at guild: ${guildId} from user: ${message.author.id}`);
      logger.debug(`input prefix: ${prefix}  configPrefix: ${config.commandPrefix}`);

      const voiceChannel = message.member.voice.channel;
      if (prefix === config.commandPrefix) {
        const context: CommandContext = {
          type: "text",
          session: voiceChannel ? getSession(voiceChannel.id) : null,
          config: config,
          guild: message.guild,
          user: message.member,
          textChannel: message.channel as TextChannel,
        };
        // logger.debug(context);
        logger.debug("emit command");
        this.emit("command", command, messageSlice, context);
      } else {
        logger.debug("emit message");
        this.emit("message", guildId, message);
      }
    });

    client.on("interaction", (interaction) => {
      if (!interaction.isCommand()) return;
      logger.debug(`receive interaction ${interaction.command?.name}`);

      const guild = interaction.guild;
      if (!guild) return; //これでmemberがGuildMemberに確定するはず
      const config = getGuildConfig(guild.id);

      const member: GuildMember = interaction.member as GuildMember;
      const voiceChannel = member.voice.channel;

      const context: CommandContext = {
        type: "interaction",
        interaction: interaction,
        session: voiceChannel ? getSession(voiceChannel.id) : null,
        config: config,
        guild: guild,
        user: member,
        textChannel: interaction.channel as TextChannel,
      };

      // logger.debug(context);
      logger.debug("emit command");
      if (!interaction.command) return;
      //微妙かも
      const options = interaction.options.data.map((opt) => String(opt.value));

      this.emit("command", interaction.command?.name, options, context);
    });

    client.on("voiceStateUpdate", (oldState, newState) => {
      if (!newState.guild.id) return;
      const guildId = newState.guild.id;

      if (oldState.member !== newState.member) return;
      if (!oldState.member || !newState.member) return;

      if (oldState.channel?.id !== newState.channel?.id) {
        this.emit("moveChannel", guildId, newState.member, oldState.channel, newState.channel);
        return;
      }

      if (oldState.channel?.id === newState.channel?.id && !!oldState.channel?.id) {
        if (!oldState.selfVideo && newState.selfVideo) {
          this.emit("turnOnVideo", guildId, newState.member);
          return;
        }

        if (oldState.selfVideo && !newState.selfVideo) {
          this.emit("turnOffVideo", guildId, newState.member);
          return;
        }

        if (!oldState.streaming && newState.streaming) {
          this.emit("turnOnGoLive", guildId, newState.member);
          return;
        }

        if (oldState.streaming && !newState.streaming) {
          this.emit("turnOffGoLive", guildId, newState.member);
          return;
        }
      }
    });

    process.on("exit", () => {
      this.emit("destroy");
    });
  }
}
