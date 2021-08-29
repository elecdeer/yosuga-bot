//ラッパー

import ss, { Socket } from "@sap_oss/node-socketio-stream";
import { getLogger } from "log4js";
import { io, Socket as SIOSocket } from "socket.io-client";
import { Readable } from "stream";

import { wait } from "../util";

const logger = getLogger("SIOAudioRecorder");

export class SIOAudioRecorder {
  protected socketIO: SIOSocket;
  protected socketStream: Socket;

  constructor(wsUrl: string) {
    this.socketIO = io(wsUrl);
    this.socketStream = ss(this.socketIO);
  }

  async recordAudioStream(startPlayingRemoteAudio: () => Promise<unknown>): Promise<Readable> {
    logger.debug("emit start");
    this.socketIO.emit("start");
    const stream = this.receiveStream();
    await startPlayingRemoteAudio();
    await wait(100);
    return await stream;
  }

  protected receiveStream(): Promise<Readable> {
    //streamが来始めたらResolveされる
    return new Promise<Readable>((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        reject(new Error("receiveStream timeout"));
      }, 3000);

      this.socketStream.once("sendStream", (stream: Readable) => {
        logger.debug("on sendStream");
        stream.on("data", (chunk) => {
          logger.debug(chunk);
        });
        stream.on("close", () => {
          logger.debug("close");
        });
        stream.on("end", () => {
          logger.debug("end");
        });
        stream.on("pause", () => {
          logger.debug("pause");
          // stream.resume();
        });
        stream.on("error", (err) => {
          logger.debug("error", err);
        });

        clearTimeout(timeoutTimer);
        resolve(stream);
      });
    });
  }
}
