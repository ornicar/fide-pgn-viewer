import { Subject } from 'rxjs';


export abstract class StockfishTask<T> {
  protected _result$ = new Subject<T>();
  result$ = this._result$.asObservable();
  protected result: T;
  private _isCompleted = false;
  private _isProcessed = false;

  complete() {
    if (this.isCompleted) return;
    this._isCompleted = true;
    this._isProcessed = false;
    if (this.result) this._result$.next(this.result);
    this._result$.complete();
  }

  start() {
    this._isCompleted = false;
    this._isProcessed = true;
  }

  get isCompleted() {
    return this._isCompleted;
  }

  get isProcessed() {
    return this._isProcessed;
  }

  abstract parseMsg(msg: string);

  abstract get commands(): string[];
}
