declare module "@sap_oss/node-socketio-stream" {
  import { EventEmitter } from "events";
  import { Socket as SIOSocket } from "socket.io-client";
  import { Duplex, DuplexOptions, Readable, ReadableOptions } from "stream";

  export default lookup;

  declare function lookup(sio: SIOSocket, options?: StreamSocketOption): Socket;

  export declare function createStream(options?: IOStreamConstructor): IOStream;

  export declare function createBlobReadStream(
    blob: Blob,
    option?: BlobReadStreamOption
  ): BlobReadStream;

  interface StreamSocketOption {
    forceBase64: boolean;
  }

  export declare class Socket extends EventEmitter {
    constructor(sio: SIOSocket, options?: StreamSocketOption);
  }

  interface IOStreamOption extends DuplexOptions {
    allowHalfOpen: boolean;
  }

  export declare class IOStream extends Duplex {
    constructor(option?: IOStreamOption);
  }

  interface BlobReadStreamOption extends ReadableOptions {
    synchronous: boolean;
  }

  export declare class BlobReadStreamOption extends Readable {
    constructor(option?: BlobReadStreamOption);
  }
}
