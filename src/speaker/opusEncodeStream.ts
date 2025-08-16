import { OpusEncoder } from "@discordjs/opus";
import { Transform } from "stream";

import type { TransformCallback } from "stream";

export class OpusEncodeStream extends Transform {
  private encoder: OpusEncoder;
  private buffer: Buffer;
  private readonly chunkSize: number;

  public constructor(option: { rate: number; channels: number; frameSize: number }) {
    super({ objectMode: true });
    this.encoder = new OpusEncoder(option.rate, option.channels);

    this.buffer = Buffer.alloc(0);
    this.chunkSize = option.frameSize * option.channels * 2;
  }

  public override _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    let n = 0;
    while (this.buffer.length >= this.chunkSize * (n + 1)) {
      const buf = this.buffer.subarray(n * this.chunkSize, (n + 1) * this.chunkSize);
      const encoded = this.encoder.encode(buf);
      this.push(encoded);
      n++;
    }

    if (n > 0) {
      this.buffer = this.buffer.subarray(n * this.chunkSize);
    }

    callback();
  }

  override _destroy(err: Error | null, cb: (error: Error | null | undefined) => void) {
    super._destroy(err, cb);
  }
}
