import { SessionEventHandlerRegistrant } from "../types";
import { Session } from "../session";
import { GuildMember } from "discord.js";
import { createEmbedBase } from "../util";
import { getLogger } from "log4js";

const logger = getLogger("sessionEvent");
export const registerAutoLeave: SessionEventHandlerRegistrant = (session) => {
  const config = session.getConfig();
  const timeToAutoLeaveMs = config.timeToAutoLeaveSec * 1000;

  session.on("leaveChannel", () => {
    const memberNumExcludedBot = getMemberNumExcludedBot(session);
    if (memberNumExcludedBot > 0) return;

    logger.debug(`setLeaveTimer: ${timeToAutoLeaveMs} ms`);

    const timer = setTimeout(() => {
      session.off("enterChannel", handleEnterChannel);
      leaveRoom();
    }, timeToAutoLeaveMs);

    const handleEnterChannel = (member: GuildMember) => {
      //退出前に人が入ってきたら取り消し
      if (getMemberNumExcludedBot(session) > 0) {
        logger.debug(`autoLeave cancel`);
        clearTimeout(timer);
      }
    };
    session.on("enterChannel", handleEnterChannel);
  });

  const leaveRoom = () => {
    const embed = createEmbedBase().setDescription(
      "一定時間ボイスチャンネルに誰もいなくなったため退出しました."
    );

    void session
      .getTextChannel()
      .send({ embeds: [embed] })
      .then(() => {
        session.disconnect();
      });
  };
};

const getMemberNumExcludedBot = (session: Session): number =>
  session.connection.channel.members.filter((member) => !member.user.bot).size;
