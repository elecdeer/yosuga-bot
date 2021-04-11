import { VoiceroidSpeaker } from "./voiceroidSpeaker";
import { AIVoiceSpeaker } from "./aivoiceSpeaker";

type Status<T> =
  | {
      status: "checking";
    }
  | {
      status: "active";
      speaker: T;
    }
  | {
      status: "inactive";
      reason: inactiveReason;
    };

type inactiveReason = "alreadyUsed" | "notWorking";

export type SpeakerMap = {
  voiceroid: Status<VoiceroidSpeaker>;
  aivoice: Status<AIVoiceSpeaker>;
};

const createVoiceroidSpeaker = async (): Promise<Status<VoiceroidSpeaker>> => {
  const voiceroidSpeaker = new VoiceroidSpeaker();
  if (!(await voiceroidSpeaker.checkIsActiveSynthesizer())) {
    return {
      status: "inactive",
      reason: "notWorking",
    };
  }

  return {
    status: "active",
    speaker: voiceroidSpeaker,
  };
};

//排他制御はaivoiceSpeakerでやるべきな気もする
const aivoiceLock: Set<string> = new Set();
const acquireAIVoice = (guildId: string) => {
  aivoiceLock.add(guildId);
};
const releaseAIVoice = (guildId: string) => {
  aivoiceLock.delete(guildId);
};
const canUseAIVoice = (guildId?: string) =>
  (guildId && aivoiceLock.has(guildId)) || aivoiceLock.size === 0;

const createAIVoiceSpeaker = async (guildId: string): Promise<Status<AIVoiceSpeaker>> => {
  if (!canUseAIVoice()) {
    return {
      status: "inactive",
      reason: "alreadyUsed",
    };
  }

  const aiVoiceSpeaker = new AIVoiceSpeaker();
  if (!(await aiVoiceSpeaker.checkIsActiveSynthesizer())) {
    return {
      status: "inactive",
      reason: "notWorking",
    };
  }

  acquireAIVoice(guildId);
  return {
    status: "active",
    speaker: aiVoiceSpeaker,
  };
};

export const createSpeakerMap = (guildId: string): SpeakerMap => {
  const map: SpeakerMap = {
    voiceroid: { status: "checking" },
    aivoice: { status: "checking" },
  };

  void createVoiceroidSpeaker().then((value) => {
    map.voiceroid = value;
  });

  void createAIVoiceSpeaker(guildId).then((value) => {
    map.aivoice = value;
  });

  return map;
};

export const disposeSpeakerMap = (guildId: string): void => {
  releaseAIVoice(guildId);
};
