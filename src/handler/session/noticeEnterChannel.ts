import { VoiceState } from "discord.js";

import { Session } from "../../session";
import { YosugaClient } from "../../yosugaClient";
import { EventKeysUnion } from "../base/handler";
import { SessionContextHandler } from "../base/sessionContextHandler";
import { enterVoiceChannelFilter } from "../filter/enterVoiceChannelFilter";
import { composeFilter, EventFilterGenerator, filterer } from "../filter/eventFilter";

export class NoticeEnterChannel extends SessionContextHandler<["voiceStateUpdate"]> {
  constructor(yosuga: YosugaClient, session: Session) {
    super(["voiceStateUpdate"], yosuga, session);
  }

  protected override filter(
    eventName: EventKeysUnion<["voiceStateUpdate"]>
  ): ReturnType<EventFilterGenerator<EventKeysUnion<["voiceStateUpdate"]>, unknown>> {
    return composeFilter(
      super.filter(eventName),
      enterVoiceChannelFilter(this.session.getVoiceChannel()),
      filterer((oldState, newState) => {
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
      text: `${this.session.getUsernamePronunciation(member)}が入室しました。`,
    });
  }
}
