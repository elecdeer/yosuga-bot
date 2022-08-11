import type { GeneralConfig, PersonalConfig } from "./interaface";

export const personalConfigDefault: Omit<PersonalConfig, "snowflake" | "level"> = {
  voiceId: null,
  pitch: 1.0,
  intonation: 1.0,
};

export const generalConfigDefault: Omit<GeneralConfig, "snowflake" | "level"> = {
  volume: 1.0,
  speed: 1.0,
  fastSpeedScale: 1.2,
  readEnterExit: true,
  readTimeSignal: true,
  timeAutoLeave: 10 * 1000,
  timeReReadName: 10 * 1000,
  readMaxLength: 80,
};
