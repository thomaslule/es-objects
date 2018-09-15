export interface Event {
  aggregate: string;
  id: string;
  sequence: number;
  insertDate: string;
  [x: string]: any;
}
