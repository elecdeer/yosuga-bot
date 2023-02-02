import { ClearCommand } from "./command/clearCommand";
import { AddSpeakerDaemonSub } from "./command/configSub/addSpeakerDaemonSub";
import { AddSpeakerTtsSub } from "./command/configSub/addSpeakerTtsSub";
import { AddSpeakerVoicevoxSub } from "./command/configSub/addSpeakerVoicevoxSub";
import { SetAutoLeaveSecSub } from "./command/configSub/setAutoLeaveSecSub";
import { SetFastSpeedSub } from "./command/configSub/setFastSpeedSub";
import { SetIgnorePrefixSub } from "./command/configSub/setIgnorePrefixSub";
import { SetMaxLengthSub } from "./command/configSub/setMaxLengthSub";
import { SetReadNameIntervalSub } from "./command/configSub/setReadNameIntervalSub";
import { SetReadStatusUpdateSub } from "./command/configSub/setReadStatusUpdateSub";
import { SetSpeedSub } from "./command/configSub/setSpeedSub";
import { SetVoiceSub } from "./command/configSub/setVoiceSub";
import { SetVolumeSub } from "./command/configSub/setVolumeSub";
import { ShowConfigSub } from "./command/configSub/showConfigSub";
import { EndCommand } from "./command/endCommand";
import { GuildConfigCommand } from "./command/guildConfigCommand";
import { MasterConfigCommand } from "./command/masterConfigCommand";
import { StartCommand } from "./command/startCommand";
import { TestCommand } from "./command/testCommand";
import { UserConfigCommand } from "./command/userConfigCommand";
import { VersionCommand } from "./command/versionCommand";
import { VoiceStatusCommand } from "./command/voiceStatusCommand";
import { DeployGlobalHandler } from "./global/deployGlobalHandler";
import { DeployGuildHandler } from "./global/deployGuildHandler";
import { UndeployGlobalHandler } from "./global/undeployGlobalHandler";
import { UndeployGuildHandler } from "./global/undeployGuildHandler";

import type { CommandHandler } from "./base/commandHandler";
import type { Handler } from "./base/handler";
import type { YosugaClient } from "../yosugaClient";
import type { Client } from "discord.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerList = Handler<any>[];

//TODO
// Helpコマンドとかどうするのか
// キャッシュした方がいいか？

export const loadHandlers = (client: Client, yosuga: YosugaClient): HandlerList => {
  return [
    new DeployGlobalHandler(yosuga),
    new DeployGuildHandler(yosuga),
    new UndeployGuildHandler(yosuga),
    new UndeployGlobalHandler(yosuga),
    ...loadCommands(client, yosuga),
  ];
};

export const loadCommands = (client: Client, yosuga: YosugaClient): CommandHandler[] => {
  return [
    new VersionCommand(yosuga),
    new StartCommand(yosuga),
    new EndCommand(yosuga),
    new ClearCommand(yosuga),
    new VoiceStatusCommand(yosuga),
    new UserConfigCommand(yosuga, [
      new ShowConfigSub(yosuga, "USER"),
      new SetVoiceSub(yosuga, "USER"),
    ]),
    new GuildConfigCommand(yosuga, [
      new ShowConfigSub(yosuga, "GUILD"),
      new SetAutoLeaveSecSub(yosuga, "GUILD"),
      new SetFastSpeedSub(yosuga, "GUILD"),
      new SetIgnorePrefixSub(yosuga, "GUILD"),
      new SetMaxLengthSub(yosuga, "GUILD"),
      new SetReadNameIntervalSub(yosuga, "GUILD"),
      new SetReadStatusUpdateSub(yosuga, "GUILD"),
      new SetSpeedSub(yosuga, "GUILD"),
      new SetVoiceSub(yosuga, "GUILD"),
      new SetVolumeSub(yosuga, "GUILD"),
    ]),
    new MasterConfigCommand(yosuga, [
      new ShowConfigSub(yosuga, "MASTER"),
      new SetAutoLeaveSecSub(yosuga, "MASTER"),
      new SetFastSpeedSub(yosuga, "MASTER"),
      new SetIgnorePrefixSub(yosuga, "MASTER"),
      new SetMaxLengthSub(yosuga, "MASTER"),
      new SetReadNameIntervalSub(yosuga, "MASTER"),
      new SetReadStatusUpdateSub(yosuga, "MASTER"),
      new SetSpeedSub(yosuga, "MASTER"),
      new SetVoiceSub(yosuga, "MASTER"),
      new SetVolumeSub(yosuga, "MASTER"),
      new AddSpeakerDaemonSub(yosuga, "MASTER"),
      new AddSpeakerVoicevoxSub(yosuga, "MASTER"),
      new AddSpeakerTtsSub(yosuga, "MASTER"),
    ]),
    new TestCommand(yosuga),
  ];
};

export const hookHandlers = (handlers: HandlerList, client: Client): void => {
  client.setMaxListeners(50);
  handlers.forEach((handler) => {
    handler.hookEvent(client);
  });
};
