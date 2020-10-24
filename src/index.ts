import {AsyncQueue, ErrorCallback} from "async";

require("dotenv").config();


import {Channel, Client, Message, VoiceConnection} from "discord.js";
import {AxiosResponse} from "axios";



const Discord = require("discord.js");
const client: Client = new Discord.Client();

const axios = require("axios").default;
axios.defaults.baseURL = process.env.VOICEROID_DEAMON_URL;

const async = require("async");


// type SessionState = "Connecting" | "Disconnected"

type SpeechParam = Partial<{
	Text: string,
	Kana: string,
	Speaker: Partial<{
		Volume: number,
		Speed: number,
		Emphasis: number,
		PauseMiddle: number,
		PauseLong: number,
		PauseSentence: number
	}>
}>




type Session = {
	// state: SessionState
	connection: VoiceConnection,
	textChannel: Channel,
	speechQueue: AsyncQueue<SpeechParam>,
	lastSpeaker: string
};

type ServerConfig = {
	commandPrefix: string,
	connectCommand: string,
	disconnectCommand: string,
};
// interface SessionState{
//
// }

//各ボイス接続時の状態など
const sessionStateMap: Record<string, Session> = {};

//各サーバ上でのbot設定
const serverConfigMap: Record<string, Partial<ServerConfig>> = {};

const defaultConfig: ServerConfig = {
	commandPrefix: "yosuga",
	connectCommand: "s",
	disconnectCommand: "e"
}

client.once("ready", () => {
	console.log("ready!");
});

client.on("message", async message => {
	if(!message.guild) return;
	if(message.author.bot) return;

	const sessionState = sessionStateMap[message.channel.id];
	const config = {...defaultConfig, ...serverConfigMap[message.guild.id]};
	console.log(config);

	if(message.content.startsWith(config.commandPrefix)){
		await handleCommand(message, sessionState, config);
		return;
	}

	await handleText(message, sessionState, config);


})


const handleCommand = async (message: Message, sessionState: Session, config: ServerConfig) => {
	const args = message.content.slice(config.commandPrefix.length).trim().split(" ");
	const command = args.shift() || "";

	if(command === config.connectCommand){
		console.log("connect");
		if(! message.member) return;


		if(message.member.voice.channel){
			const connection = await message.member.voice.channel.join();

			const queue = async.queue((param: SpeechParam, cb: ErrorCallback<Error>) => {
				speech(connection, param).then(value => {

					//TODO 話す間隔も調整できるように
					setTimeout(() => {
						cb();
					}, 500)

				})
			}, 1);

			queue.drain(() => {
				console.log("queue empty");
			})


			sessionStateMap[message.channel.id] = {
				connection: connection,
				textChannel: message.channel,
				speechQueue: queue,
				lastSpeaker: ""
			};

		}else {
			await message.reply('You need to join a voice channel first!');
		}

		return;
	}

	if(command === config.disconnectCommand){
		console.log("disconnect");

		if(!sessionState?.connection) return;

		sessionState.connection.disconnect();

		delete sessionStateMap[message.channel.id];

		return;
	}
}

type TextMiddleware = (text: string) => string;



const textProcessors: Array<TextMiddleware> = [
	(text => {
		return text;
	}),
]

const handleText = async (message: Message, session: Session, config: ServerConfig) => {
	//読み上げ

	console.log("read push");

	if(!session) return;

	const baseText = message.content;

	const text = textProcessors.reduce((prev, middleware) => middleware(prev), baseText)

	const param: SpeechParam = {
		Text: text,
		Speaker: {
			Speed: 1.5
		}
	}

	session.speechQueue.push(param);

	// const port = process.env.VOICEROID_DEAMON_URL || "";
	// const url = URL.resolve(port, )

}


const speech = async (connection: VoiceConnection, param: SpeechParam) => (
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