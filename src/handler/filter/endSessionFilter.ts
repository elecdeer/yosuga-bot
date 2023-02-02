import { composeFilter, filterer } from "./eventFilter";
import { leaveVoiceChannelFilter } from "./leaveVoiceChannelFilter";

import type { EventFilterGenerator } from "./eventFilter";
import type { VoiceOrStageChannel } from "../../types";
import type { Client } from "discord.js";

/**
 * セッションの終了時、すなわちYosugaがVCから退出した時のみ通過するイベントフィルタ
 * @param voiceChannel
 */
export const endSessionFilter: EventFilterGenerator<
  "voiceStateUpdate",
  Readonly<VoiceOrStageChannel>
> = (voiceChannel) =>
  composeFilter(
    leaveVoiceChannelFilter(voiceChannel),
    filterer<"voiceStateUpdate">((oldState, newState) => {
      const client: Client = oldState.client;
      if (!client.isReady()) return false;
      //抜けたのはyosuga自身
      return oldState.id === client.user.id;
    })
  );
