import { VoiceState } from "discord.js";

import { Session } from "../../session";
import { YosugaClient } from "../../yosugaClient";
import { EventKeysUnion } from "../base/handler";
import { SessionContextHandler } from "../base/sessionContextHandler";
import { composeFilter, EventFilterGenerator } from "../filter/eventFilter";
import { turnOnGoLiveFilter } from "../filter/turnOnCameraFilter";

export class NoticeTurnOnGoLive extends SessionContextHandler<["voiceStateUpdate"]> {
  constructor(yosuga: YosugaClient, session: Session) {
    super(["voiceStateUpdate"], yosuga, session);
  }

  protected override filter(
    eventName: EventKeysUnion<["voiceStateUpdate"]>
  ): ReturnType<EventFilterGenerator<EventKeysUnion<["voiceStateUpdate"]>, unknown>> {
    return composeFilter(
      super.filter(eventName),
      turnOnGoLiveFilter(this.session.getVoiceChannel())
    );
  }

  protected override async onEvent(
    eventName: "voiceStateUpdate",
    oldState: VoiceState,
    newState: VoiceState
  ): Promise<void> {
    const member = oldState.member;
    await this.session.pushSpeech({
      text: `${this.session.getUsernamePronunciation(member)}がゴーライブを開始しました。`,
    });
  }
}
