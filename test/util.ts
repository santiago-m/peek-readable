// Utilities for testing

import { Readable } from 'node:stream';
// @ts-ignore
import { ReadableStream, ReadableByteStreamController } from 'node:stream/web';

/**
 * A mock Node.js readable-stream, using string to read from
 */
export class SourceStream extends Readable {

  private buf: Buffer;

  constructor(private str: string = '') {
    super();

    this.buf = Buffer.from(str, 'latin1');
  }

  public _read() {
    this.push(this.buf);
    this.push(null); // push the EOF-signaling `null` chunk
  }
}

/**
 * A mock ReadableStream, using string to read from
 */
export class WebSourceStream extends ReadableStream<Uint8Array> {

  constructor(private str: string = '') {
    super(new WebSource(Buffer.from(str, 'latin1')));
  }

}

class WebSource {

  public type = 'bytes';
  public autoAllocateChunkSize = this.buffer.length;

  constructor(private buffer: Uint8Array, ) {
  }

  start() {
  }

  pull(controller: ReadableByteStreamController) {
    controller.enqueue(this.buffer);
    controller.close();
  }

  cancel() {};
}
