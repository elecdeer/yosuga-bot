import {Guild, TextChannel, VoiceBroadcast, VoiceChannel, VoiceConnection} from "discord.js";
import async, {QueueObject} from "async";
import {client} from "./index";
import {logger} from "./commandManager";
import {Speaker, SpeechParam} from "./speaker/speaker";
import {getGuildConfig} from "./guildConfig";
import {VoiceroidSpeaker} from "./speaker/voiceroidSpeaker";
import {Readable} from "stream";

const sessionStateMap: Record<string, Session> = {};

export const getSession = (guildId: string): (Session | null) => {
	if(guildId in sessionStateMap){
		return sessionStateMap[guildId];
	}else{
		return null;
	}
}

export class Session{
	connection: VoiceConnection | null;
	voiceChannel: VoiceChannel;
	textChannel: TextChannel;
	speechQueue: QueueObject<SpeechParam>;
	guild: Guild;

	//仮
	speaker: Speaker

	lastMessageTimestamp: number;
	lastMessageAuthorId: string;

	constructor(voiceChannel: VoiceChannel, textChannel: TextChannel, guild: Guild){
		this.connection = null;
		this.voiceChannel = voiceChannel;
		this.textChannel = textChannel;
		this.guild = guild;

		this.speechQueue = this.createQueue();

		this.lastMessageTimestamp = 0;
		this.lastMessageAuthorId = "";

		this.speaker = new VoiceroidSpeaker();

		sessionStateMap[guild.id] = this;

	}

	private createQueue(){
		const queue = async.queue(async (param: SpeechParam) => {
			logger.debug("consume queue");
			logger.debug(param);

			const config = getGuildConfig(this.guild.id);
			const connectedParam: SpeechParam = {
				Text: param.Text,
				Kana: param.Kana,
				Speaker: {...config.defaultSpeakerParam, ...param.Speaker}
			}

			await this.broadcastSpeech(connectedParam);

		});

		return queue;
	}

	broadcastSpeech(param: SpeechParam){
		const connection = this.connection;
		if(!connection){
			logger.error("broadcastSpeechを呼ぶ前にconnectVoiceChannelを呼ぶ必要がある");
			return;
		}

		return this.speaker.getSpeech(param)
			.then((data) => new Promise((resolve, reject) => {
				connection.play(data).once("finish", () => {
					resolve(null);
				})
			}))
			.catch(reason => {
				logger.error(reason);
			})
	}

	async connectVoiceChannel(){
		this.connection = await this.voiceChannel.join();
	}

	disconnect(){
		logger.info(`disconnect: ${this.voiceChannel.id}`);
		this.connection?.disconnect();
		this.speechQueue.kill();
		delete sessionStateMap[this.guild.id];
	}

	pushSpeech(param: SpeechParam, timestamp?: number, authorId?: string){
		this.speechQueue.push(param);
		this.lastMessageTimestamp = timestamp ?? Date.now();
		this.lastMessageAuthorId = authorId ?? client.user?.id ?? "unknown";
	}




}