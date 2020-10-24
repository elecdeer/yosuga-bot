require("dotenv").config();


import {Channel, Client, Message, TextChannel, VoiceConnection} from "discord.js";
import {AxiosPromise, AxiosResponse} from "axios";


const Discord = require("discord.js");
const client: Client = new Discord.Client();

const axios = require("axios").default;
axios.defaults.baseURL = process.env.VOICEROID_DEAMON_URL;

const async = require("async");

// type SessionState = "Connecting" | "Disconnected"

type SpeechParam = Partial<{
	Text: string,
	Kana: string,
	Speaker: {
		Volume: number,
		Speed: number,
		Emphasis: number,
		PauseMiddle: number,
		PauseLong: number,
		PauseSentence: number
	}
}>


type Session = {
	// state: SessionState
	connection: VoiceConnection,
	textChannel: Channel
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

			sessionStateMap[message.channel.id] = {
				connection: connection,
				textChannel: message.channel,
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


const handleText = async (message: Message, sessionState: Session, config: ServerConfig) => {
	//読み上げ
	//ミドルウェアで加工する

	console.log("read");

	if(!sessionState) return;

	const text = message.content;
	const param: SpeechParam = {
		"Text": text
	}

	// const port = process.env.VOICEROID_DEAMON_URL || "";
	// const url = URL.resolve(port, )


	axios({
		method: "POST",
		url: "/api/speechtext",
		responseType: "stream",
		data: param
	})
		.then((res: AxiosResponse) => {
			console.log("got wav");
			sessionState.connection.play(res.data).once("finish", () => {
				console.log("playFinish");
			})
		})
		.catch((reason: any) => {
			console.log(reason);
			return;
		})
}







client.login(process.env.DISCORD_TOKEN);


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