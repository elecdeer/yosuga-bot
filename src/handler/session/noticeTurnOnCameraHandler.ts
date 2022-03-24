import { VoiceState } from "discord.js";

import { Session } from "../../session";
import { YosugaClient } from "../../yosugaClient";
import { EventKeysUnion } from "../base/handler";
import { SessionContextHandler } from "../base/sessionContextHandler";
import { composeFilter, EventFilterGenerator } from "../filter/eventFilter";
import { voiceStatusSessionFilter } from "../filter/sessionFilter";
import { turnOnGoLiveFilter } from "../filter/turnOnCameraFilter";

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
      turnOnGoLiveFilter(this.session.voiceChannel)
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
