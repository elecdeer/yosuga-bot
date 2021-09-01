import { SessionEventHandlerRegistrant } from "../types";

export const registerLeaveRoom: SessionEventHandlerRegistrant = (session) => {
  session.on("leaveChannel", async (member) => {
    await session.pushSpeech({
      text: `${session.getUsernamePronunciation(member)}が退室しました。`,
    });
  });
};
