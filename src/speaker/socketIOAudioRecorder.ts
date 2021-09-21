//ラッパー

import ss, { Socket } from "@sap_oss/node-socketio-stream";
import { getLogger } from "log4js";
import { io, Socket as SIOSocket } from "socket.io-client";
import { Readable } from "stream";

import { failure, Result, success } from "../result";
import { wait } from "../util";

const logger = getLogger("SIOAudioRecorder");

export class SIOAudioRecorder {
  protected socketIO: SIOSocket;
  protected socketStream: Socket;

  constructor(wsUrl: string) {
    this.socketIO = io(wsUrl);
    this.socketStream = ss(this.socketIO);
  }

  isActiveConnection(): boolean {
    return this.socketIO.active;
  }

  async recordAudioStream(
    startPlayingRemoteAudio: () => Promise<unknown>
  ): Promise<Result<Readable, Error>> {
    // logger.debug("emit start");

    try {
      this.socketIO.emit("start");
      const stream = this.receiveStream();
      await startPlayingRemoteAudio();
      return success(await stream);
    } catch (e) {
      return failure(e as Error);
    }
  }

  protected receiveStream(): Promise<Readable> {
    const timeout = wait(3000).then(() => Promise.reject("receiveStream timeout"));

    const receive = new Promise<Readable>((resolve) => {
      this.socketStream.once("sendStream", (stream: Readable) => {
        // logger.debug("on sendStream");

        //中身が無くてもdataはlistenする必要がある
        //無いと音質が下がる
        stream.once("data", (chunk) => {
          resolve(stream);
        });

        stream.on("close", () => {
          // logger.debug("close");
        });
        stream.on("end", () => {
          // logger.debug("end");
        });
        stream.on("pause", () => {
          // logger.debug("pause");
          // stream.resume();
        });
        stream.on("error", (err) => {
          // logger.debug("error", err);
        });
      });
    });

    return Promise.race([timeout, receive]);
  }
}
