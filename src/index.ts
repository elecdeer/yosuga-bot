import {AsyncQueue, AsyncResultCallback, ErrorCallback} from "async";
import {Client, Guild, Message, TextChannel, VoiceConnection} from "discord.js";
import {AxiosResponse} from "axios";

import Discord from "discord.js";
import axios from "axios";
import async from "async";

import {emojiProcessor, guildEmojiProcessor, urlProcessor} from "./processor";

require("dotenv").config();
const client: Client = new Discord.Client();
axios.defaults.baseURL = process.env.VOICEROID_DEAMON_URL;


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
	textChannel: TextChannel,
	speechQueue: AsyncQueue<SpeechParam>,
	lastMessage: Message | null
};

type ServerConfig = {
	commandPrefix: string,
	connectCommand: string,
	disconnectCommand: string,
};

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

	const sessionState = sessionStateMap[message.guild.id];
	const config = {...defaultConfig, ...serverConfigMap[message.guild.id]};
	console.log(config);

	if(message.content.startsWith(config.commandPrefix)){
		await handleCommand(message, sessionState, config);
		return;
	}

	await handleText(message, sessionState, config);


})


const handleCommand = async (message: Message, session: Session, config: ServerConfig) => {
	if(!message.guild) return;

	const channel = message.channel;
	if(! (channel instanceof TextChannel)) return;

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


			sessionStateMap[message.guild.id] = {
				connection: connection,
				textChannel: channel,
				speechQueue: queue,
				lastMessage: null,
			};

		}else {
			await message.reply('You need to join a voice channel first!');
		}

		return;
	}

	if(command === config.disconnectCommand){
		console.log("disconnect");

		if(!session?.connection) return;

		disconnect(session, message.guild);

		return;
	}
}

const disconnect = (session: Session, guild: Guild) => {
	session.connection.disconnect();
	delete sessionStateMap[guild.id];
}



const handleText = async (message: Message, session: Session, config: ServerConfig) => {
	console.log(message);

	//読み上げ

	console.log("handleText");

	// console.log(session);
	if(!session) return;


	let baseText = message.content;

	// console.log("lastTime: " + session.textChannel.lastMessage?.createdTimestamp);
	// console.log("messageTime: " + message.createdTimestamp);

	if(message.attachments.size > 0){
		baseText = baseText + " " + message.attachments.map(attachment => attachment.url).toString();
	}

	//名前読み上げ

	const difMs = message.createdTimestamp - (session.lastMessage?.createdTimestamp || 0);
	console.log("timeDif: " + difMs);
	if(session.lastMessage?.author.id !== message.author.id || difMs > 30000){
		baseText = `${message.member?.displayName}　${baseText}`;
	}

	const text = await
		urlProcessor(baseText)
			.then(emojiProcessor)
			.then(guildEmojiProcessor);

	const param: SpeechParam = {
		Text: text,
		Speaker: {
			Speed: 1.5
		}
	}

	console.log("push")
	session.speechQueue.push(param);
	session.lastMessage = message;

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

client.on("voiceStateUpdate", (oldState, newState) => {
	const session = sessionStateMap[newState.guild.id];
	const config = {...defaultConfig, ...serverConfigMap[newState.guild.id]};

	if(!session) return;

	if(!oldState.channel && !!newState.channel){
		if(session.connection.channel.id !== newState.channelID) return;

		console.log("join");
		// console.log(newState.member?.user);


		const param: SpeechParam = {
			Text: `${newState.member?.user.username}が入室しました`,
			Speaker: {
				Speed: 1.5
			}
		}

		session.speechQueue.push(param);
	}
	if(!!oldState.channel && !newState.channel){
		if(session.connection.channel.id !== oldState.channelID) return;

		if(oldState.channel.members.size <= 1){
			session.textChannel.send("ボイスチャンネルに誰もいなくなったため退出しました").then(() => {
				console.log("disconnect");
				disconnect(session, oldState.guild);
			});
		}


		console.log("leave")
		// console.log(newState.member?.user);

		const param: SpeechParam = {
			Text: `${newState.member?.user.username}が退室しました`,
			Speaker: {
				Speed: 1.5
			}
		}

		session.speechQueue.push(param);

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