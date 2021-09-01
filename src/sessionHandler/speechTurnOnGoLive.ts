import { SessionEventHandlerRegistrant } from "../types";

export const registerTurnOnGoLive: SessionEventHandlerRegistrant = (session) => {
  session.on("turnOnGoLive", async (member) => {
    await session.pushSpeech({
      text: `${session.getUsernamePronunciation(member)}がゴーライブを開始しました。`,
    });
  });
};
