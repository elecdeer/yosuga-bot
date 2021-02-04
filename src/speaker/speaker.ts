import {VoiceBroadcast} from "discord.js";
import {Readable} from "stream";


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

export interface Speaker{
	/**
	 * SpeechParamから再生可能な音声データを取得
	 * @param param
	 */
	getSpeech: (param: SpeechParam) => Promise<string | VoiceBroadcast | Readable>,

	/**
	 * バックで動いている音声合成エンジンが機能しているかテストする
	 */
	test: () => Promise<"ok" | Error>
}