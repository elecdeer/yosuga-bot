import {ProcessorProvider} from "../processor";

export const maxLengthProcessor: ProcessorProvider<number> = (max: number) => async text => {
	const charArray = Array.from(text)

	//サロゲートペアを考慮した長さ
	const length = charArray.length;

	if(length <= max){
		return text;
	}

	return charArray.slice(0, max).join("") + " 以下略";
}