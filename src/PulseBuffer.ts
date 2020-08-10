export default class PulseBuffer {

  private backing: Buffer;

  constructor(buffer: Buffer){

    this.backing = buffer;
  }

  static from (buffer: Buffer): PulseBuffer {

    return new this(buffer);
  }

  /**
   * @returns {Buffer} Current backing buffer
   */
  get buffer(): Buffer {

    return this.backing;
  }

  public addPulse(high: number, low: number) {

    const extended = Buffer.alloc(this.backing.length + 8);
    this.backing.copy(extended);
    extended.writeUInt32BE(high, extended.length - 4);
    extended.writeUInt32BE(low, extended.length - 8);
    this.backing = extended;
  }

  [Symbol.iterator]() {

    let index: number = 0;
    const width = 4 * 2;
    const { backing } = this;
    const length = this.backing.length;

    return {
      next() {

        if(index > length - width){
          return { done: true };
        }else{

         const data = {
            value: [ backing.readUInt32BE(index), backing.readUInt32BE(index + 4) ],
            done: false
          };

          index += width;
          return data;
        }
      }
    }
  }
}
