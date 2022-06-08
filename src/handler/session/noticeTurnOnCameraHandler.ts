import { SessionContextHandler } from "../base/sessionContextHandler";
import { composeFilter } from "../filter/eventFilter";
import { voiceStatusSessionFilter } from "../filter/sessionFilter";
import { turnOnCameraFilter } from "../filter/turnOnCameraFilter";

import type { Session } from "../../session";
import type { YosugaClient } from "../../yosugaClient";
import type { EventKeysUnion } from "../base/handler";
import type { EventFilterGenerator } from "../filter/eventFilter";
import type { VoiceState } from "discord.js";

export class NoticeTurnOnCameraHandler extends SessionContextHandler<["voiceStateUpdate"]> {
  constructor(yosuga: YosugaClient, session: Session) {
    super(["voiceStateUpdate"], yosuga, session);
  }

  protected override filter(
    eventName: EventKeysUnion<["voiceStateUpdate"]>
  ): ReturnType<EventFilterGenerator<EventKeysUnion<["voiceStateUpdate"]>, unknown>> {
    return composeFilter(
      super.filter(eventName),
      voiceStatusSessionFilter(this.session),
      turnOnCameraFilter(this.session.voiceChannel)
    );
  }

  protected override async onEvent(
    eventName: "voiceStateUpdate",
    oldState: VoiceState,
    newState: VoiceState
  ): Promise<void> {
    const member = oldState.member;
    await this.session.pushSpeech({
      text: `${this.session.getUsernamePronunciation(member)}がカメラをオンにしました。`,
    });
  }
}
