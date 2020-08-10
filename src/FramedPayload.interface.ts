
export interface FramedPayload {
  sync: {
    high: number,
    low: number
  };
  data: Buffer;
}