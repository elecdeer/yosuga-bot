// import {IOStream} from "@sap_oss/node-socketio-stream/lib"

declare module "@sap_oss/node-socketio-stream" {
  import { Socket as SIOSocket } from "socket.io-client";
  import { Duplex, DuplexOptions, Readable, ReadableOptions } from "stream";
  import { EventEmitter } from "events";

  declare function lookup(sio: SIOSocket, options?: StreamSocketOption): Socket;

  export declare function createStream(options?: IOStreamConstructor): IOStream;

  export declare function createBlobReadStream(
    blob: Blob,
    option?: BlobReadStreamOption
  ): BlobReadStream;

  export = lookup;

  interface StreamSocketOption {
    forceBase64: boolean;
  }

  declare class Socket extends EventEmitter {
    constructor(sio: SIOSocket, options?: StreamSocketOption);
  }

  interface IOStreamOption extends DuplexOptions {
    allowHalfOpen: boolean;
  }

  declare class IOStream extends Duplex {
    constructor(option?: IOStreamOption);
  }

  interface BlobReadStreamOption extends ReadableOptions {
    synchronous: boolean;
  }

  declare class BlobReadStreamOption extends Readable {
    constructor(option?: BlobReadStreamOption);
  }
}
