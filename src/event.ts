export interface Event {
  readonly aggregate: string;
  readonly id: string;
  readonly sequence: number;
  readonly insertDate: string;
  readonly [x: string]: any;
}
