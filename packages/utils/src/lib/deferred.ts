import { Function1 } from 'lodash';

export class Deferred<T = any> {
  promise: Promise<T>;
  reject!: Function1<any, void>;
  resolve!: Function1<T, void>;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }

  reset() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}
