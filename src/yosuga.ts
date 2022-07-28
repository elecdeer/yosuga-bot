import { getLogger } from "log4js";

import { createEventFlow } from "./eventFlow/eventFlow";
import { registerHandlers } from "./handler";

import type { IEventFlow } from "./eventFlow/eventFlow";
import type { Message, VoiceState, Client, Interaction } from "discord.js";
import type { Logger } from "log4js";

export type YosugaEvent<T extends Record<string, unknown>> = IEventFlow<YosugaEventParam<T>>;
export type YosugaEventParam<T extends Record<string, unknown>> = {
  yosuga: Yosuga;
  logger: Logger;
} & T;

type Events = {
  messageCreate: YosugaEvent<{
    message: Message;
  }>;
  interactionCreate: YosugaEvent<{
    interaction: Interaction;
  }>;
  voiceStateUpdate: YosugaEvent<{
    oldState: VoiceState;
    newState: VoiceState;
  }>;
};

export class Yosuga {
  private readonly client: Client<true>;

  public readonly events: Events = {
    messageCreate: createEventFlow(),
    interactionCreate: createEventFlow(),
    voiceStateUpdate: createEventFlow(),
  };

  constructor(client: Client<true>) {
    this.client = client;

    this.wrapEvents();
    this.registerLogHandlers();
    registerHandlers(this);
  }

  private wrapEvents() {
    this.client.on("messageCreate", (message: Message) => {
      const logger = getLogger("messageCreate");
      logger.addContext("eventId", message.id);
      this.events.messageCreate.emit({ yosuga: this, message, logger });
    });

    this.client.on("interaction", (interaction: Interaction) => {
      const logger = getLogger("interactionCreate");
      logger.addContext("eventId", interaction.id);
      this.events.interactionCreate.emit({ yosuga: this, interaction, logger });
    });

    this.client.on("voiceStateUpdate", (oldState: VoiceState, newState: VoiceState) => {
      const logger = getLogger("voiceStateUpdate");
      logger.addContext("eventId", newState.id);
      this.events.voiceStateUpdate.emit({ yosuga: this, oldState, newState, logger });
    });
  }

  private registerLogHandlers() {
    this.events.messageCreate.on(({ logger }) => {
      logger.debug("event called: messageCreate");
    });
    this.events.interactionCreate.on(({ logger }) => {
      logger.debug("event called: interactionCreate");
    });
    this.events.voiceStateUpdate.on(({ logger }) => {
      logger.debug("event called: voiceStateUpdate");
    });
  }
}
