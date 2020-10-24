


require("dotenv").config({path: "../.env"});

const axios = require("axios").default;

const URL = require("url");

const port = process.env.VOICEROID_DEAMON_URL || "";
const url = URL.resolve(port, "");

console.log(url);

axios.get(url).then((value) => {
  console.log(value);
});


// axios({
// 	method: "GET",
// 	url: url,
// 	responseType: "stream",
// 	data: param
// })
// 	.then((res: AxiosPromise) => {
// 		console.log("got wav");
// 		sessionState.connection.play(res).once("finish", () => {
// 			console.log("playFinish");
// 		})
// 	})
// 	.catch((reason: any) => {
// 		console.log(reason);
// 		return;
// 	})