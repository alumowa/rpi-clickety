import Pigpio, { Gpio } from 'pigpio';
import { EventEmitter } from 'events';

import Framer from './Framer';
import { FramedPayload } from './FramedPayload.interface';
import PulseBuffer from './PulseBuffer';

export default class Receiver extends EventEmitter {

  private receiver: Gpio;
  private framer: Framer;
  private _listening = false;

  constructor(pin: number){

    super();

    this.receiver = new Gpio(pin, { mode: Gpio.INPUT });
    this.framer = new Framer();
    this.framer.on('data', this.decodeBuffer.bind(this));
  }

  private decodeBuffer({ sync, data }: FramedPayload){

    const timings = PulseBuffer.from(data);

    //Calculate base pulse length using the sync bit timings.
    //This should be about 32x the pulse length.
    const pulseLength = Math.trunc((sync.low + sync.high) / 32);
    const pulseTolerance = 0.6 * pulseLength;
    const pulseLong = 3 * pulseLength;
    const pulseLongTolerance = 3 * pulseTolerance;
    const bitLen = 4 * pulseLength;
    const bitTolerance = 4 * pulseTolerance;

    let code = 0;

    for(let [high, low] of timings){

      code <<= 1;

      //Validation: Combined, they should equal to ~4x pulseLength within some tolerance
      if(Math.abs((high + low) - bitLen) > bitTolerance){
        return;
      }

      //high var always refers to high duration as either pulse train
      //starts with high val. If high is a long pulse, it's a 1
      //bit. Otherwise zero (do nothing).
      if(Math.abs(high - pulseLong) < pulseLongTolerance) {
        code |= 1;
      }
    }

    timings.addPulse(sync.high, sync.low); //Append sync pulse
    return this.emit('code', {
      code,
      raw: timings.buffer.toString('base64'),
      info: { pulseLength, sync },
    });
  }

  listenStop(): void {

    if(!this._listening) return;

    this.receiver.removeAllListeners();
    this.receiver.disableAlert();
    this.framer.reset();
    this._listening = false;
  }

  listenStart(): void {

    if(this._listening) return;

    this.receiver.on('alert', this.framer.onData.bind(this.framer));
    this.receiver.enableAlert();
    this._listening = true;
  }
}