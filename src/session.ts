import {Guild, TextChannel, VoiceChannel, VoiceConnection} from "discord.js";
import async, {QueueObject} from "async";
import {client, SpeechParam} from "./index";
import {logger} from "./commandManager";

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

		sessionStateMap[guild.id] = this;

	}

	private createQueue(){
		const queue = async.queue(async (param: SpeechParam) => {
			logger.debug("consume queue");
			logger.debug(param);
		});

		return queue;



		// const queue = async.queue((param: SpeechParam, cb) => {
		// 	const config = getGuildConfig(guild.id);
		//
		// 	const connectedParam: SpeechParam = {
		// 		Text: param.Text,
		// 		Kana: param.Kana,
		// 		Speaker: {...config.defaultSpeakerParam, ...param.Speaker}
		// 	}
		//
		// 	speech(connection, connectedParam).then(value => {
		// 		cb();
		// 	})
		// }, 1);
		//
		// queue.drain(() => {
		// 	console.log("queue empty");
		// })
	}

	async broadcastSpeech(param: SpeechParam){

	}

	async connectVoiceChannel(){
		this.connection = await this.voiceChannel.join();
	}

	disconnect(){
		logger.info(`disconnect: ${this.voiceChannel.id}`);
		this.connection?.disconnect();
		delete sessionStateMap[this.guild.id];
	}

	pushSpeech(param: SpeechParam, timestamp?: number, authorId?: string){
		this.speechQueue.push(param);
		this.lastMessageTimestamp = timestamp ?? Date.now();
		this.lastMessageAuthorId = authorId ?? client.user?.id ?? "unknown";
	}




}