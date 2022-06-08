import { SessionContextHandler } from "../base/sessionContextHandler";
import { composeFilter, filterer } from "../filter/eventFilter";
import { leaveVoiceChannelFilter } from "../filter/leaveVoiceChannelFilter";
import { voiceStatusSessionFilter } from "../filter/sessionFilter";

import type { Session } from "../../session";
import type { YosugaClient } from "../../yosugaClient";
import type { EventKeysUnion } from "../base/handler";
import type { EventFilterGenerator } from "../filter/eventFilter";
import type { VoiceState } from "discord.js";

export class NoticeLeaveChannelHandler extends SessionContextHandler<["voiceStateUpdate"]> {
  constructor(yosuga: YosugaClient, session: Session) {
    super(["voiceStateUpdate"], yosuga, session);
  }

  protected override filter(
    eventName: EventKeysUnion<["voiceStateUpdate"]>
  ): ReturnType<EventFilterGenerator<EventKeysUnion<["voiceStateUpdate"]>, unknown>> {
    return composeFilter(
      super.filter(eventName),
      voiceStatusSessionFilter(this.session),
      leaveVoiceChannelFilter(this.session.voiceChannel),
      filterer<"voiceStateUpdate">((oldState, newState) => {
        const member = newState.member!;
        return member.id !== this.yosuga.client.user.id;
      })
    );
  }

  protected override async onEvent(
    eventName: "voiceStateUpdate",
    oldState: VoiceState,
    newState: VoiceState
  ): Promise<void> {
    const member = oldState.member;
    await this.session.pushSpeech({
      text: `${this.session.getUsernamePronunciation(member)}が退室しました。`,
    });
  }
}
