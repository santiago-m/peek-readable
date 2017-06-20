import * as Promise from "promise";
import * as stream from "stream";

interface IReadRequest {
  buffer: Buffer,
  offset: number,
  length: number,
  position?: number,
  deferred: Deferred<number>
}

class Deferred<T> {

  public promise: Promise<T>;
  public resolve: (value: T) => void;
  public reject: (reason: any) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}

export class StreamReader {

  /**
   * Used to reject read if end-of-stream has been reached
   * @type {Error}
   */
  public static EndOfStream = new Error("End-Of-Stream");

  /**
   * Deferred read request
   */
  private request: IReadRequest;

  private endOfStream = false;

  public constructor(private s: stream.Readable) {
    this.s.once("end", () => {
      this.endOfStream = true;
      if(this.request) {
        this.request.deferred.reject(StreamReader.EndOfStream);
      }
      this.request = null;
    });
  }

  // Read chunk from stream
  public read(buffer: Buffer, offset: number, length: number, position: number = null): Promise<number> {

    this.request = {
      buffer,
      offset,
      length,
      position,
      deferred: new Deferred<number>()
    };
    this.tryRead();
    return this.request.deferred.promise;
  }

  private tryRead() {
    const readBuffer = this.s.read(this.request.length);
    if (readBuffer) {
      readBuffer.copy(this.request.buffer, this.request.offset);
      this.request.deferred.resolve(this.request.length);
      process.nextTick(() => {
        this.request = null;
      })
    } else {
      this.s.once("readable", () => {
        this.tryRead();
      });
    }
  }
}