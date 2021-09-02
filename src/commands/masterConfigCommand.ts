import log4js from "log4js";

import { CommandPermission } from "../permissionUtil";
import { CommandGroup } from "./commandGroup";
import { AddSpeakerDaemonSub } from "./configSubCommands/addSpeakerDaemonSub";
import { AddSpeakerTtsSub } from "./configSubCommands/addSpeakerTtsSub";
import { VoiceSub } from "./configSubCommands/voiceSub";

const commandLogger = log4js.getLogger("command");

export class MasterConfigCommand extends CommandGroup {
  constructor() {
    super({
      name: "master-config",
      description: "Yosugaインスタンス全体の設定を変更",
      permission: CommandPermission.AppOwner,
    });

    this.addSubCommand(new AddSpeakerDaemonSub());
    this.addSubCommand(new AddSpeakerTtsSub());
    this.addSubCommand(new VoiceSub());
  }
}
