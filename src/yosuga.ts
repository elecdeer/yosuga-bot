import { createEventFlow } from "./eventFlow/eventFlow";
import { registerHandlers } from "./handler";
import { getLogger } from "./logger";
import { createRepository } from "./repository";
import { generalConfigDefault, personalConfigDefault } from "./repository/defaultValue";

import type { IEventFlow } from "./eventFlow/eventFlow";
import type { Logger } from "./logger";
import type { Message, VoiceState, Client, Interaction } from "discord.js";

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

  public readonly repository = createRepository();

  constructor(client: Client<true>) {
    this.client = client;

    this.wrapEvents();
    this.registerLogHandlers();
    registerHandlers(this);
    void this.initRepository();
  }

  private wrapEvents() {
    this.client.on("messageCreate", (message: Message) => {
      const logger = getLogger("messageCreate", {
        eventId: message.id,
      });
      this.events.messageCreate.emit({ yosuga: this, message, logger });
    });

    this.client.on("interactionCreate", (interaction: Interaction) => {
      const logger = getLogger("interactionCreate", {
        eventId: interaction.id,
      });
      this.events.interactionCreate.emit({ yosuga: this, interaction, logger });
    });

    this.client.on("voiceStateUpdate", (oldState: VoiceState, newState: VoiceState) => {
      const logger = getLogger("voiceStateUpdate", {
        eventId: newState.id,
      });
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

  private async initRepository() {
    const appId = this.client.application?.id;

    const personalAppConfig = await this.repository.personalLevel.read(appId);
    if (!personalAppConfig) {
      await this.repository.personalLevel.create({
        snowflake: appId,
        level: "app",
        ...personalConfigDefault,
      });
    }

    const generalAppConfig = await this.repository.generalLevel.read(appId);
    if (!generalAppConfig) {
      await this.repository.generalLevel.create({
        snowflake: appId,
        level: "app",
        ...generalConfigDefault,
      });
    }
  }
}
