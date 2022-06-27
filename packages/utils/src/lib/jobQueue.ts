import { Deferred } from './deferred';

export class JobQueue {
  _queue: any;
  isProcessing: any;
  constructor() {
    this._queue = [];
    this.isProcessing = false;
  }

  addJob(exeFunc: any) {
    const def = new Deferred();
    this._queue.push({
      def,
      exeFunc,
    });
    this._checkJob();

    return def.promise;
  }

  private _checkJob() {
    if (this.isProcessing) return;
    if (this._queue.length <= 0) return;
    const itm = this._queue.shift();
    this._exeJob(itm);
  }

  private async _exeJob({ def, exeFunc }: any) {
    try {
      this.isProcessing = true;
      const res = await exeFunc();
      def.resolve(res);
    } catch (error) {
      def.reject(error);
    } finally {
      this.isProcessing = false;
      this._checkJob();
    }
  }
}
