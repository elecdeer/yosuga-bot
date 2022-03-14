import { VoiceOrStageChannel } from "../../types";
import { EventFilter, FilterChecker, filterer } from "./eventFilter";

/**
 * 呼び出されたイベントがvoiceChannelからの退室を示すものであるかどうか
 * @param voiceChannel
 */
export const isLeaveVoiceChannelCall: FilterChecker<
  "voiceStateUpdate",
  Readonly<VoiceOrStageChannel>
> =
  (voiceChannel) =>
  (...args) => {
    const [oldState, newState] = args;
    if (!newState.guild.id) return false;
    if (!oldState.member || !newState.member) return false;
    if (oldState.member !== newState.member) return false;

    //退出: oldがsessionのチャンネル & newが別チャンネル|無し
    const sessionVCId = voiceChannel.id;
    return oldState.channelId === sessionVCId && newState.channelId !== sessionVCId;
  };

/**
 * voiceChannelからの退室時のみ通過するイベントフィルタ
 * @param voiceChannel
 */
export const leaveVoiceChannelFilter: EventFilter<
  "voiceStateUpdate",
  Readonly<VoiceOrStageChannel>
> = filterer(isLeaveVoiceChannelCall);
