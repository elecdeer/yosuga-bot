import { Collection } from "discord.js";
import { ValueOf } from "type-fest";

import { SpeakerBuildOption } from "../speaker/voiceProvider";
import { SpeakerOption } from "../types";
import { UnifiedConfig } from "./typesConfig";

export const stringifyConfigEntry = (
  configKey: string,
  configValue: Readonly<ValueOf<UnifiedConfig>>
): { name: string; value: string } => {
  if (configKey === "speakerBuildOptions") {
    const collection = new Collection<string, SpeakerBuildOption>(Object.entries(configValue));

    const value = collection
      .map((value) => {
        const entries = Object.entries(value)
          .filter(([key, value]) => {
            if (typeof value === "function") return false;
            return key !== "voiceName";
          })
          .map(([key, value]) => {
            return ` ${key}: ${value}`;
          })
          .join("\n");

        return `${value.voiceName}\n\`${entries}\``;
      })
      .join("\n");

    return {
      name: configKey,
      value: value,
    };
  }

  if (configKey === "speakerOption") {
    const option = configValue as SpeakerOption;
    return {
      name: configKey,
      value: `${option.speakerName}\n pitch: ${option.voiceParam.pitch}  intonation: ${option.voiceParam.intonation}`,
    };
  }

  if (typeof configValue === "object") {
    return {
      name: configKey,
      value: JSON.stringify(configValue, null, 2),
    };
  }

  return {
    name: configKey,
    value: configValue.toString(),
  };
};
