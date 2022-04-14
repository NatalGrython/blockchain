export interface Packet<T = any> {
  pattern: any;
  data?: T;
}
