import {Client, VoiceState} from "discord.js";
import log4js from "log4js";
import {getGuildConfig} from "./guildConfig";
import {getSession, Session} from "./session";
import {createEmbedBase, handleCommand} from "./commands/commands";
import {handleText} from "./textSpeech";


const logger = log4js.getLogger();
export const setHandler = (client: Client): void => {
	client.once("ready", () => {
		logger.info("bot ready");
	});

	client.on("message", (message) => {
		logger.debug("on message");

		if(!message.guild) return;
		if(message.author.bot) return;

		logger.debug("process message");

		const guildId = message.guild.id;
		const sessionState = getSession(guildId);

		const config = getGuildConfig(guildId);

		if(message.content.startsWith(config.commandPrefix)){
			handleCommand(message, sessionState, config);
			return;
		}

		//紐付けられたテキストチャンネルでの発言
		if(sessionState?.textChannel?.id === message.channel.id){
			handleText(message, sessionState, config);
			return;
		}
	});


	client.on("voiceStateUpdate", (oldState, newState) => {
		logger.debug("on voiceStateUpdate");

		const session = getSession(newState.guild.id);
		if(!session?.connection) return;

		//チャンネルが変わった
		if(oldState.channel?.id !== newState.channel?.id){
			if(newState.channel?.id === session.connection.channel.id){
				handleEnterRoom(oldState, newState, session);
				return;
			}else{
				handleLeaveRoom(oldState, newState, session);
				return;
			}
		}


		if(oldState.member !== newState.member) return;
		if(!oldState.selfVideo && newState.selfVideo){
			handleTurnOnVideo(oldState, newState, session);
			return;
		}

		if(oldState.selfVideo && !newState.selfVideo){
			handleTurnOffVideo(oldState, newState, session);
			return;
		}

		if(!oldState.streaming && newState.streaming){
			handleTurnOnLive(oldState, newState, session);
			return;
		}

		if(oldState.streaming && !newState.streaming){
			handleTurnOffLive(oldState, newState, session);
			return;
		}
	})
}


//
// const handleCommand = (message: Message, session: Session | null) => {
//
// }
//
// const handleText = (message: Message, session: Session) => {
//
// }

const handleEnterRoom = (oldState: VoiceState, newState: VoiceState, session: Session) => {
	logger.debug("handleEnterRoom");

	session.pushSpeech({
		Text: `${session.getUsernamePronunciation(newState.member)}が入室しました。`
	});
}

const handleLeaveRoom = (oldState: VoiceState, newState: VoiceState, session: Session) => {
	logger.debug("handleLeaveRoom");

	const channel = oldState.channel;
	if(!channel) return;//既にチェック済みではある
	const memberNumExcludedBot = channel.members.filter(member => !member.user.bot).size;

	//bot以外の接続者が0
	if(memberNumExcludedBot <= 0){
		const embed = createEmbedBase()
			.setDescription("ボイスチャンネルに誰もいなくなったため退出しました.");

		session.textChannel.send(embed).then(() => {
			session.disconnect();
		});
	}else{
		session.pushSpeech({
			Text: `${session.getUsernamePronunciation(newState.member)}が退室しました。`
		});
	}
}

const handleTurnOnVideo = (oldState: VoiceState, newState: VoiceState, session: Session) => {
	logger.debug("handleTurnOnVideo");
	session.pushSpeech({
		Text: `${session.getUsernamePronunciation(newState.member)}がカメラをオンにしました。`
	});
}

const handleTurnOffVideo = (oldState: VoiceState, newState: VoiceState, session: Session) => {
	logger.debug("handleTurnOffVideo");
}

const handleTurnOnLive = (oldState: VoiceState, newState: VoiceState, session: Session) => {
	logger.debug("handleTurnOnLive");
	session.pushSpeech({
		Text: `${session.getUsernamePronunciation(newState.member)}がゴーライブを開始しました。`
	});
}

const handleTurnOffLive = (oldState: VoiceState, newState: VoiceState, session: Session) => {
	logger.debug("handleTurnOffLive");
}


