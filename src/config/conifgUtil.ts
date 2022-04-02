import { Collection, Formatters } from "discord.js";

import { SpeakerBuildOption } from "../speaker/voiceProvider";
import { UnifiedConfig } from "./typesConfig";

export const stringifyConfigEntry = <T extends keyof UnifiedConfig>(
  configKey: T,
  configValue: UnifiedConfig[T]
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
            return `${key}: ${value}`;
          })
          .join("\n");

        return `${value.voiceName}\n${Formatters.inlineCode(entries)}`;
      })
      .join("\n");

    return {
      name: configKey,
      value: value,
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
