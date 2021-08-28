import { SessionEventHandlerRegistrant } from "../types";
import { Session } from "../session";
import { GuildMember } from "discord.js";
import { createYosugaEmbed } from "../util";
import { getLogger } from "log4js";

const logger = getLogger("sessionEvent");
export const registerAutoLeave: SessionEventHandlerRegistrant = (session) => {
  const config = session.getConfig();
  const timeToAutoLeaveMs = config.timeToAutoLeaveSec * 1000;

  session.on("leaveChannel", (member: GuildMember) => {
    const memberNumExcludedBot = getMemberNumExcludedBot(session);
    if (memberNumExcludedBot > 0) return;

    const yosugaUserId = session.getYosugaUserId();
    if (member.id === yosugaUserId) return;

    logger.debug(`setLeaveTimer: ${timeToAutoLeaveMs} ms`);

    const timer = setTimeout(() => {
      session.off("enterChannel", handleEnterChannel);
      leaveRoom();
    }, timeToAutoLeaveMs);

    const cancelAutoLeave = () => {
      logger.debug(`cancelAutoLeave`);
      clearTimeout(timer);
      session.off("enterChannel", handleEnterChannel);
      session.off("leaveChannel", handleLeaveChannelAgain);
    };

    const handleEnterChannel = (member: GuildMember) => {
      //退出前に人が入ってきたら取り消し
      if (getMemberNumExcludedBot(session) > 0) {
        cancelAutoLeave();
      }
    };
    session.on("enterChannel", handleEnterChannel);

    const handleLeaveChannelAgain = (member: GuildMember) => {
      if (member.id === yosugaUserId) {
        cancelAutoLeave();
      }
    };

    session.on("leaveChannel", handleLeaveChannelAgain);
  });

  const leaveRoom = () => {
    const embed = createYosugaEmbed().setDescription(
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
  session.getVoiceChannel().members.filter((member) => !member.user.bot).size;
// session.connection.channel.members.filter((member) => !member.user.bot).size;
