import { YosugaEventEmitter } from "./yosugaEventEmitter";
import { Client } from "discord.js";
import { yosugaEnv } from "./environment";
import { registerCommandHandler } from "./globalHandler/command";
import { client } from "./index";
import { getLogger } from "log4js";
import { registerSessionFactory } from "./sessionManager";
import { CommandManager } from "./commandManager";
import { StartCommand } from "./commands/startCommand";
import { EndCommand } from "./commands/endCommand";
import { ClearCommand } from "./commands/clearCommand";
import { HelpCommand } from "./commands/helpCommand";
import { VersionCommand } from "./commands/versionCommand";
import { ReloadCommand } from "./commands/reloadCommand";

const logger = getLogger("yosugaClient");

export class YosugaClient extends YosugaEventEmitter {
  readonly client: Client;

  readonly commandManager: CommandManager;

  constructor(discordClient: Client) {
    super(discordClient);

    this.client = discordClient;

    this.commandManager = new CommandManager(this);
    this.assignCommands();
  }

  initClient(): void {
    this.client
      .login(yosugaEnv.discordToken)
      .then(async (res) => {
        if (!client.application?.owner) await client.application?.fetch();
        return res;
      })
      .then((res) => {
        logger.info("bot login");
        logger.info(`token: ${res}`);
        logger.info(`applicationOwner: ${client.application?.owner}`);

        this.initEmitter();
        // assignCommands();

        void this.commandManager.registerSlashCommand().catch((err) => {
          logger.warn(err);
        });
      })
      .catch((err) => {
        logger.error("failed to login discord");
        logger.error(err);
      });
  }

  protected initEmitter(): void {
    registerSessionFactory(this);
    registerCommandHandler(this);
  }

  protected assignCommands(): void {
    logger.debug("assign commands");
    this.commandManager.assign(new StartCommand());
    this.commandManager.assign(new EndCommand());
    this.commandManager.assign(new ClearCommand());
    this.commandManager.assign(new HelpCommand());
    this.commandManager.assign(new VersionCommand());
    this.commandManager.assign(new ReloadCommand());
  }
}
