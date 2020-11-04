import async, {AsyncQueue, AsyncResultCallback, ErrorCallback} from "async";
import {Client, Guild, Message, TextChannel, VoiceChannel, VoiceConnection} from "discord.js";
import {AxiosResponse} from "axios";

import Discord from "discord.js";
import axios from "axios";

import {createEmbedBase, handleCommand} from "./commandManager";
import {handleText} from "./textSpeech";

require("dotenv").config();
const client: Client = new Discord.Client();
axios.defaults.baseURL = process.env.VOICEROID_DEAMON_URL;


export type SpeechParam = Partial<{
	Text: string,
	Kana: string,
	Speaker: SpeakerParam,
}>

export type SpeakerParam = Partial<{
	Volume: number,
	Speed: number,
	Emphasis: number,
	PauseMiddle: number,
	PauseLong: number,
	PauseSentence: number
}>




export type Session = {
	// state: SessionState
	connection: VoiceConnection,
	textChannel: TextChannel,
	speechQueue: AsyncQueue<SpeechParam>,

	lastMessageTimestamp: number,
	lastMessageAuthorId: string
};

export type ServerConfig = {
	commandPrefix: string,
	defaultSpeakerParam: SpeakerParam
	// connectCommand: string,
	// disconnectCommand: string,
};

//各ボイス接続時の状態など
export const sessionStateMap: Record<string, Session> = {};

//各サーバ上でのbot設定
export const serverConfigMap: Record<string, Partial<ServerConfig>> = {};


const defaultConfig: ServerConfig = {
	commandPrefix: "yosuga",
	defaultSpeakerParam: {
		Speed: 1.5
	}
}

client.once("ready", () => {
	console.log("ready!");
});


client.on("message", async message => {
	if(!message.guild) return;
	if(message.author.bot) return;

	const sessionState = sessionStateMap[message.guild.id];
	const config = {...defaultConfig, ...serverConfigMap[message.guild.id]};
	// console.log(config);

	if(message.content.startsWith(config.commandPrefix)){
		await handleCommand(message, sessionState, config);
		return;
	}

	await handleText(message, sessionState, config);

})


export const connect = async (voiceChannel: VoiceChannel, textChannel: TextChannel, guild: Guild) => {
	const connection = await voiceChannel.join();

	const queue = async.queue((param: SpeechParam, cb) => {
		const config = {...defaultConfig, ...serverConfigMap[guild.id]};

		const connectedParam: SpeechParam = {
			Text: param.Text,
			Kana: param.Kana,
			Speaker: {...config.defaultSpeakerParam, ...param.Speaker}
		}

		speech(connection, connectedParam).then(value => {
			cb();
		})
	}, 1);

	queue.drain(() => {
		console.log("queue empty");
	})


	sessionStateMap[guild.id] = {
		connection: connection,
		textChannel: textChannel,
		speechQueue: queue,
		lastMessageTimestamp: 0,
		lastMessageAuthorId: client.user?.id || "unknown"
	};

}

export const disconnect = (session: Session, guild: Guild) => {
	session.connection.disconnect();
	delete sessionStateMap[guild.id];
}


export const speech = async (connection: VoiceConnection, param: SpeechParam) => (
	axios({
		method: "POST",
		url: "/api/speechtext",
		responseType: "stream",
		data: param
	})
		.then((res: AxiosResponse) => new Promise((resolve, reject) => {
			console.log("got wav");
			connection.play(res.data).once("finish", () => {
				console.log("playFinish");
				resolve();
			})

			//タイムアウトもここに?
		}))
		.catch((reason: any) => {
			console.log(reason);
			return;
		})
)


export const pushSpeech = ({session, param, authorId, timestamp}: {
	session: Session, param: SpeechParam, timestamp?: number, authorId?: string
}) => {
	// console.log("push")
	session.speechQueue.push(param);
	session.lastMessageTimestamp = timestamp || Date.now();
	session.lastMessageAuthorId = authorId || client.user?.id || "unknown";
}


client.on("voiceStateUpdate", (oldState, newState) => {
	const session = sessionStateMap[newState.guild.id];
	const config = {...defaultConfig, ...serverConfigMap[newState.guild.id]};

	if(!session) return;

	if(!oldState.channel && !!newState.channel){
		if(session.connection.channel.id !== newState.channelID) return;

		console.log("join");
		// console.log(newState.member?.user);

		// pushSpeech(session, )

		pushSpeech({
			session: session,
			param: {
				Text: `${newState.member?.user.username}が入室しました`
			},
		});

	}
	if(!!oldState.channel && !newState.channel){
		if(session.connection.channel.id !== oldState.channelID) return;

		if(oldState.channel.members.size <= 1){

			const embed = createEmbedBase()
				.setDescription("ボイスチャンネルに誰もいなくなったため退出しました.");

			session.textChannel.send(embed).then(() => {
				console.log("disconnect");
				disconnect(session, oldState.guild);
			});
		}


		console.log("leave")
		// console.log(newState.member?.user);


		pushSpeech({
			session: session,
			param: {
				Text: `${newState.member?.user.username}が退室しました`
			},
		});

	}

	// console.log("===old================================================================================")
	// console.log(oldState.channel);
	//
	// console.log("===new================================================================================")
	// console.log(newState.channel);
	// // console.log(newState.member);
})



client.login(process.env.DISCORD_TOKEN).then(r => {
	console.log("login")
	console.log(r);
});


// process.on("beforeExit", function() {
// 	console.log("Exitting...");
// 	for(let key in sessionStateMap){
// 		const session = sessionStateMap[key];
// 		if(!!session.connection){
// 			session.connection.disconnect();
// 		}
// 	}
// })
// process.on("SIGINT", function () {
// 	process.exit(0);
// });