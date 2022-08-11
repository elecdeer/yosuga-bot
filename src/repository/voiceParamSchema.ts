import { z } from "zod";

import type { Voice } from "./interaface";
import type { Voice as RawVoice } from "@prisma/client";

export const VoicevoxParamSchema = z.object({
  type: z.literal("voicevox"),
  rootUrl: z.string().url(),
  speakerUUID: z.string().uuid(),
  styleName: z.string(),
});

export const VoiceroidDaemonParamSchema = z.object({
  type: z.literal("voiceroidDaemon"),
  url: z.string().url(),
});

export const VoiceParamSchema = z.discriminatedUnion("type", [
  VoicevoxParamSchema,
  VoiceroidDaemonParamSchema,
]);

export const parseVoice = (rawVoice: RawVoice): Voice => {
  const parsed = VoiceParamSchema.parse(JSON.parse(rawVoice.params));

  return {
    ...rawVoice,
    type: parsed.type,
    params: parsed,
  };
};

export const parseVoiceNullable = (rawVoice: RawVoice | null): Voice | null => {
  if (rawVoice === null) {
    return null;
  }

  return parseVoice(rawVoice);
};
