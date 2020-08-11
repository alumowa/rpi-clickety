import { Gpio } from 'pigpio';
import Pigpio from 'pigpio';
import PulseBuffer from './PulseBuffer';

export default class Transmitter {


  private transmitter: Gpio;
  private sending: boolean = false;

  constructor(pin: number) {

    this.transmitter = new Gpio(pin, { mode: Gpio.OUTPUT });
  }

  private txWave(wave: Pigpio.GenericWaveStep[], attempts: number) {

    this.sending = true;
    this.transmitter.digitalWrite(0);
    Pigpio.waveAddGeneric(wave);
    const waveId = Pigpio.waveCreate();

    if(waveId >= 0){
      for(let attempt = 0; attempt < attempts; attempt++){

        Pigpio.waveTxSend(waveId, Pigpio.WAVE_MODE_ONE_SHOT);
        while(Pigpio.waveTxBusy()){}
      }
    }

    Pigpio.waveDelete(waveId);
    this.sending = false;
  }

  public transmit(code: number = 1406211, attempts: number = 3): boolean {

    //Prevent if currently sending
    if(this.sending) {
      return false;
    }

    Pigpio.waveClear();

    const { gpio: pin } = this.transmitter;
    const len = 24;
    const wave = [];
    const pulseLength = 190;

    for(var i = 0; i <= len - 1; i++){

      const mask = 0x01 << (len - 1 - i);
      const val = (code & mask) >> (len - 1 - i);

      //if 1, send long + short. Otherwise short + long
      if(val === 1){
        wave.push({ gpioOn: pin, gpioOff: 0, usDelay: 3 * pulseLength });
        wave.push({ gpioOn: 0, gpioOff: pin, usDelay: pulseLength });
      }else{
        wave.push({ gpioOn: pin, gpioOff: 0, usDelay: pulseLength });
        wave.push({ gpioOn: 0, gpioOff: pin, usDelay: 3 * pulseLength });
      }

    }

    //Add sync bit
    wave.push({ gpioOn: pin, gpioOff: 0, usDelay: pulseLength });
    wave.push({ gpioOn: 0, gpioOff: pin, usDelay: 31 * pulseLength });

    this.txWave(wave, attempts);
    return true;
  }

  public transmitRaw(data: string, attempts: number = 3): boolean {

    //Prevent if currently sending
    if(this.sending) {
      return false;
    }

    const { gpio: pin } = this.transmitter;
    const timings = new PulseBuffer(Buffer.from(data, 'base64'));
    const wave = [];

    for(let [high, low] of timings){
      wave.push({ gpioOn: pin, gpioOff: 0, usDelay: high });
      wave.push({ gpioOn: 0, gpioOff: pin, usDelay: low });
    }

    this.txWave(wave, attempts);
    return true;
  }
}