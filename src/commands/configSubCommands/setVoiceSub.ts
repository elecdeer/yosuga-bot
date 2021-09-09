import { CommandInteractionOptionResolver } from "discord.js";

import { CommandContextSlash } from "../../commandContextSlash";
import { masterConfigDefault, UserConfig } from "../../config/configManager";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";
import {
  ConfigCommandLevel,
  SetConfigSubCommand,
  isRequiredOption,
  ValidationResult,
} from "./setConfigSubCommand";

export class SetVoiceSub extends SetConfigSubCommand<UserConfig, "speakerOption"> {
  constructor(level: ConfigCommandLevel) {
    super(
      {
        name: "voice",
        description: "読み上げボイスの設定",
        options: [
          {
            name: "voicename",
            description: "ボイスの登録名",
            type: "STRING",
            required: isRequiredOption(level),
          },
          {
            name: "pitch",
            description: "声のピッチ（0 - 2)",
            type: "NUMBER",
          },
          {
            name: "intonation",
            description: "声のイントネーション（0 - 2)",
            type: "NUMBER",
          },
        ],
      },
      level,
      "speakerOption"
    );
  }

  override getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<UserConfig["speakerOption"]> | undefined
  ): UserConfig["speakerOption"] | undefined {
    const voiceName = options.getString("voicename");
    if (!voiceName) {
      return undefined;
    }

    return {
      speakerName: voiceName,
      voiceParam: {
        pitch: options.getNumber("pitch") ?? 1,
        intonation: options.getNumber("intonation") ?? 1,
      },
    };
  }
}
