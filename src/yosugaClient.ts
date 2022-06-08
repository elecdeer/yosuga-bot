import { getLogger } from "log4js";
import path from "path";

import { ConfigManager } from "./config/configManager";
import { KvsGuildConfigStore } from "./config/store/kvsGuildConfigStore";
import { KvsMasterConfigStore } from "./config/store/kvsMasterConfigStore";
import { KvsUserConfigStore } from "./config/store/kvsUserConfigStore";
import { yosugaEnv } from "./environment";
import { hookHandlers, loadHandlers } from "./handler/handlerLoader";
import { SessionManager } from "./sessionManager";

import type { Client } from "discord.js";

const logger = getLogger("yosugaClient");

export class YosugaClient {
  readonly client: Client<true>;

  readonly sessionManager: SessionManager;
  readonly configManager: ConfigManager;

  constructor(discordClient: Client<true>) {
    this.client = discordClient;

    this.sessionManager = new SessionManager(this);
    this.configManager = new ConfigManager(this, {
      master: new KvsMasterConfigStore({
        name: "master-config",
        storeFilePath: path.join(yosugaEnv.configPath, "masterConfig"),
      }),
      guild: new KvsGuildConfigStore({
        name: "guild-config",
        storeFilePath: path.join(yosugaEnv.configPath, "guildConfig"),
      }),
      user: new KvsUserConfigStore({
        name: "user-config",
        storeFilePath: path.join(yosugaEnv.configPath, "userConfig"),
      }),
    });
  }

  async initClient(): Promise<void> {
    try {
      // const token = await this.client.login(yosugaEnv.discordToken);
      // this.client.application = new ClientApplication(this.client, {});

      await this.client.application.fetch();
      await this.client.application.commands.fetch();
      logger.debug(this.client.application.commands.cache.toJSON());

      logger.info("bot login");
      // logger.info(`token: ${token}`);
      logger.info(`applicationOwner: ${this.client.application.owner}`);

      const handlers = loadHandlers(this.client, this);
      hookHandlers(handlers, this.client);
    } catch (err) {
      logger.error("failed to login discord");
      logger.error(err);
    }
  }
}
