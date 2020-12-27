
require("dotenv").config({path: "../.env"});

const axios = require("axios").default;
const async = require("async");
const URL = require("url");

const port = process.env.VOICEROID_DEAMON_URL || "";
// const url = URL.resolve(port, "");

const regexTest = () => {
  const emojiRegex = require('emoji-regex/RGI_Emoji.js');
  const regex = emojiRegex();
  const text = "🐈‍⬛は黒猫";

  console.log(text.replace(regex, "絵文字"));



}
regexTest();

//
// const urls = [
//   "https://i.gyazo.com/77e884ce2272a63625d38327954cdf21.png",
//   "https://www.google.com/",
//   "https://www.gajeoijgapoega.com/"
// ]
// console.log(urls)
//
// async.map(urls, (item, cb) => {
//   axios.head(item)
//     .then((res) => {
//       console.log(res);
//       if(res.headers["content-type"].startsWith("image")){
//         cb(null, "画像");
//       }else{
//         cb(null, "URL省略");
//       }
//     })
//     .catch((reason) => {
//       cb(null, "URL省略")
//     });
// }).then(value => {
//   console.log(value);
// });

//https://gyazo.com/77e884ce2272a63625d38327954cdf21/thumb/1000



// console.log(url);
//
// axios.get(url).then((value) => {
//   console.log(value);
// });


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