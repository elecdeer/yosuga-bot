import { SpeakerOption } from "../types";
import { UnifiedConfig } from "./typesConfig";

export const stringifyConfigEntry = <T extends keyof UnifiedConfig>(
  configKey: T,
  configValue: UnifiedConfig[T]
): { name: string; value: string } => {
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
