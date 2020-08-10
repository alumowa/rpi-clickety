import { EventEmitter } from "events";
import Pigpio from 'pigpio';

enum State {
  SEEK,
  BUFFERING
};

export default class Framer extends EventEmitter {

  private data: Buffer;
  private lastTick: number;
  private syncMarker: number;
  private maxBufferLen: number;

  private syncLowDuration: number = 0;
  private count: number = 0;
  private state: State = State.SEEK;

  constructor(syncMarker: number = 4000, maxBufferLen: number = 64) {

    super();

    this.data = Buffer.alloc(maxBufferLen * 4);
    this.syncMarker = syncMarker;
    this.maxBufferLen = maxBufferLen;
    this.lastTick = Pigpio.getTick();
  }

  public reset(): void {

    this.state = State.SEEK;
    this.count = 0;
  }

  public onData(level: number, tick: number) {

    //Compare amount of time between the last tick to the current tick
    const duration = Pigpio.tickDiff(this.lastTick, tick);

    switch(this.state){
      case State.SEEK:

        if(duration >= this.syncMarker){
          this.syncLowDuration = duration;
          this.state = State.BUFFERING;
        }
        break;
      case State.BUFFERING:

        //If we get a duration that's close to the original long duration
        //it might be the sync bit, signalling that we should process
        //the buffered data.
        if(Math.abs(duration - this.syncLowDuration) < 200 ){

          //Emit payload data along with sync bit information.
          //Note that the high part of sync was the last recorded
          this.emit('data', {
            sync: {
              high: this.data.readUInt32BE((this.count - 1) * 4),
              low: this.syncLowDuration
            },
            data: Buffer.from(this.data).slice(0, ((this.count - 1) * 4))
          });

          //Treat this new long-low as a new sync
          this.syncLowDuration = duration;
          this.count = 0;
          break;
        }

        //Only accumulate up to maxBufferLen items
        //Otherwise start over as we've been buffering noise
        if(this.count < this.maxBufferLen){
          this.data.writeUInt32BE(duration, this.count++ * 4);
        }else{
          this.reset();
        }

        break;
    }

    this.lastTick = tick;
  }
}