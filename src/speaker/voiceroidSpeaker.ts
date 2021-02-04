import {VoiceBroadcast} from "discord.js";
import {Readable} from "stream";
import axios from "axios";
import {Speaker, SpeechParam} from "./speaker";


export class VoiceroidSpeaker implements Speaker{
	async getSpeech(param: SpeechParam): Promise<string | VoiceBroadcast | Readable>{
		const res = await axios({
			method: "POST",
			url: `${process.env.VOICEROID_DEAMON_URL}/api/speechtext`,
			responseType: "stream",
			data: param
		});

		return res.data;
	}

	test(): Promise<"ok" | Error>{
		return new Promise((resolve, reject) => {
			axios({
				method: "HEAD",
				url: `${process.env.VOICEROID_DEAMON_URL}/`,
			})
				.then(res => {
					resolve("ok");
				})
				.catch(reason => {
					reject(reason);
				})
		});

	}

}

