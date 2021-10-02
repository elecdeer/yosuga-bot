//ラッパー

import ss, { Socket } from "@sap_oss/node-socketio-stream";
import { getLogger } from "log4js";
import { io, Socket as SIOSocket } from "socket.io-client";
import { Readable } from "stream";

import { wait } from "../util/promiseUtil";
import { failure, Result, success } from "../util/result";

const logger = getLogger("SIOAudioRecorder");

export class SIOAudioRecorder {
  protected socketIO: SIOSocket;
  protected socketStream: Socket;

  constructor(wsUrl: string) {
    this.socketIO = io(wsUrl);
    this.socketStream = ss(this.socketIO);
  }

  isActiveConnection(): boolean {
    return this.socketIO.active && !this.socketIO.disconnected;
  }

  async recordAudioStream(
    startPlayingRemoteAudio: () => Promise<unknown>
  ): Promise<Result<Readable, Error>> {
    try {
      this.socketIO.emit("start");
      const streamPromise = this.receiveStream();

      //Unhandled Rejectionで落ちないために必要
      streamPromise.catch((e) => {
        logger.error(e);
      });

      await startPlayingRemoteAudio();
      return success(await streamPromise);
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

  destroy(): void {
    this.socketIO.disconnect();
  }
}
