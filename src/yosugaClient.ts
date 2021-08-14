import { YosugaEventEmitter } from "./yosugaEventEmitter";
import { Client, Collection } from "discord.js";
import { yosugaEnv } from "./environment";
import { client } from "./index";
import { getLogger } from "log4js";
import { SessionManager } from "./sessionManager";
import { CommandManager } from "./commandManager";
import { StartCommand } from "./commands/startCommand";
import { EndCommand } from "./commands/endCommand";
import { ClearCommand } from "./commands/clearCommand";
import { HelpCommand } from "./commands/helpCommand";
import { VersionCommand } from "./commands/versionCommand";
import { ReloadCommand } from "./commands/reloadCommand";
import { Speaker } from "./speaker/speaker";
import { VoiceroidDaemonSpeaker } from "./speaker/voiceroidDaemonSpeaker";
import { Session } from "./session";
import { TtsControllerSpeaker } from "./speaker/ttsControllerSpeaker";
import { allSerial } from "./util";

const logger = getLogger("yosugaClient");

export class YosugaClient extends YosugaEventEmitter {
  readonly client: Client;

  readonly commandManager: CommandManager;
  readonly sessionManager: SessionManager;

  constructor(discordClient: Client) {
    super(discordClient);

    this.client = discordClient;

    this.commandManager = new CommandManager(this);
    this.assignCommands();

    this.sessionManager = new SessionManager(this);
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

        void this.commandManager.registerSlashCommand().catch((err) => {
          logger.warn(err);
        });
      })
      .catch((err) => {
        logger.error("failed to login discord");
        logger.error(err);
      });
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

  speakersFactory(session: Session): Collection<string, Speaker> {
    const collection = new Collection<string, Speaker>();

    //うまいことして環境変数からいじれるようにする
    if (yosugaEnv.voiceroidDaemonUrl) {
      collection.set("yukari", new VoiceroidDaemonSpeaker(session, yosugaEnv.voiceroidDaemonUrl));
    }

    //test
    collection.set(
      "akane",
      new TtsControllerSpeaker(session, {
        urlBase: "http://192.168.0.14:1000",
        outputDevice: "CABLE Input",
        voiceName: "琴葉 茜",
        wsUrl: "http://192.168.0.14443",
      })
    );

    const daemonSpeakers = collection.filter((speaker) => speaker.engineType === "voiceroidDaemon");
    void Promise.all(daemonSpeakers.map((speaker) => speaker.initialize()));

    const ttsSpeakers = collection.filter((speaker) => speaker.engineType === "ttsController");
    void allSerial(ttsSpeakers.map((speaker) => () => speaker.initialize()));

    return collection;
  }
}
