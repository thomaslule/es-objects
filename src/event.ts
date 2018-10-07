export interface Event {
  readonly aggregate: string;
  readonly id: string;
  readonly sequence: number;
  readonly [x: string]: any;
}
