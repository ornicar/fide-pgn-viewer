import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subject } from 'rxjs';
import { shareReplay, take, switchMap, filter, mapTo, tap, map, finalize, scan } from 'rxjs/operators';
import { StockfishTask } from '../tasks/base.task';
import { IPredictionLine, IMovePosition, IMovePositionData, IPrediction } from '../../chess-core/models/move.model';
import { PredictionsByFenTask } from '../tasks/prediction-by-fen.task';
import { StockfishTaskGetEvaluationMove } from '../tasks/evaluation.task';
import { PredictionsByMoveTask } from '@modules/predictions/tasks/prediction-by-moves.task';
import { ChessApiService } from '@modules/chess-core/services/chess-api.service';
import { SocketEvents, SocketService } from '@modules/chess-core/services/socket.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

const DEPH = 8;
const MULTI_PV = 3;

export enum Engine {
  LOCAL_STOCKFISH = 1,
  CHESSIFY_STOCKFISH = 2,
  CHESSIFY_LC_ZERO = 3
}


// description of UCI commands https://gist.github.com/aliostad/f4470274f39d29b788c1b09519e67372

@Injectable()
export class PredictionsService {
  static apiUrl = environment.apiServer;
  public engines$: Observable<Engine[]> = merge(
    this.http.get<Engine[]>(`${PredictionsService.apiUrl}/prediction_engines`),
    this.socketService.on<{ engines: Engine[] }>(SocketEvents.CHANGE_PREDICTION_ENGINE).pipe(
      map(engines => engines.engines),
    )
  ).pipe(shareReplay());
  private _uciWorker: Worker;
  private isReady$ = this.initStockfishWorker();
  private _stockfishMsg$ = new Subject<string>();
  private _tasks: StockfishTask<any>[] = [];
  private _processedTask: StockfishTask<any> = null;

  constructor(
    private ngZone: NgZone,
    private http: HttpClient,
    private chessApi: ChessApiService,
    private socketService: SocketService,
  ) {
    this._stockfishMsg$.subscribe(msg => this.proxyMsgToTask(msg));
  }

  getFilteredPredictions(widgetId: number, id: number): Observable<IPrediction<IMovePosition>[]> {
    return combineLatest(this.getPredictions(widgetId, id), this.engines$).pipe(
      map(([predictions, engines]) => predictions.filter(prediction => {
        return engines?.includes(prediction.engine) && id === prediction.move_id;
      })),
      shareReplay(),
    );
  }

  public calcPredictionsByFen(fen: string, moveNumber: number): Observable<IPrediction<IMovePosition>[]> {
    const existTaskIdx = this._tasks.findIndex(t => t instanceof PredictionsByFenTask);
    if (existTaskIdx !== -1) {
      if (this._tasks[existTaskIdx].isProcessed) {
        this._uciWorker.postMessage('stop');
      }
      this.completeTask(this._tasks[existTaskIdx]);
    }
    const task = new PredictionsByFenTask(fen, moveNumber, DEPH);
    this.addTask(task);
    return task.result$
      .pipe(map(r => Object.keys(r).map(key => r[key])));
  }

  public calcPredictionsByMoves(moves: IMovePosition[]): Observable<IPrediction<IMovePosition>[]> {
    const existTaskIdx = this._tasks.findIndex(t => t instanceof PredictionsByMoveTask);
    if (existTaskIdx !== -1) {
      if (this._tasks[existTaskIdx].isProcessed) {
        this._uciWorker.postMessage('stop');
      }
      this.completeTask(this._tasks[existTaskIdx]);
    }
    const task = new PredictionsByMoveTask(moves, DEPH);
    this.addTask(task);
    return task.result$
      .pipe(map(r => Object.keys(r).map(key => r[key])));
  }

  public getEvaluationMove(startPosition: string, moveSan: string): Observable<number> {
    const task = new StockfishTaskGetEvaluationMove(startPosition, moveSan);
    this.addTask(task);
    return task.result$;
  }

  public getPredictionsFromWebSocket(id: number): Observable<IPredictionLine<IPrediction<IMovePositionData>[]>[]> {
    return this.socketService.on<{ predictions: IPredictionLine<IPrediction<IMovePositionData>[]>[] }>(SocketEvents.PREDICTION).pipe(
      map(predictions => predictions.predictions.filter(prediction => id === prediction.move_id)),
      filter(predictions => !!predictions.length),
    );
  }

  private getPredictions(widgetId: number, id: number): Observable<IPrediction<IMovePosition>[]> {
    return merge(
      this.getPredictionsFromWebSocket(id),
      this.chessApi.getPredictionsByFen(widgetId, id),
    ).pipe(
      scan((acc, cv) => [...acc, ...cv], []),
      map((predictions) => [...new Map(predictions.map(item => [item.engine, item])).values()].reduce((acc, engine) =>
        acc.concat(engine.lines.map(line => this.chessApi.formatPositions(line, engine))),
        []
      )),
    );
  }

  private addTask(task: StockfishTask<any>) {
    this._tasks.push(task);
    if (!this._processedTask) this.executeNextTask();
  }

  private executeTask(task: StockfishTask<any>) {
    // console.log(`[predictions]: => start task`, task);
    this.ngZone.runOutsideAngular(() => {
      this._processedTask = task;
      this._processedTask.start();
      this.isReady$
        .pipe(
          take(1),
          switchMap(() => {
            this._processedTask.commands
              .forEach(cmd => {
                console.log(`[stockfish] cmd: ${cmd}`);
                this._uciWorker.postMessage(cmd);
              });
            return this._processedTask.result$;
          }),
          finalize(() => {
            this.completeTask(this._processedTask);
            this.executeNextTask();
          }),
        )
        .subscribe();
    });
  }

  private completeTask(task: StockfishTask<any>) {
    task.complete();
    const idx = this._tasks.findIndex(t => t === task);
    this._tasks.splice(idx, 1);
    this._processedTask = null;
  }

  private executeNextTask() {
    if (this._tasks.length === 0) return;
    this.executeTask(this._tasks[0]);
  }

  private proxyMsgToTask(msg: string) {
    // console.log(`[predictions] msg: `, msg);
    if (this._processedTask) this._processedTask.parseMsg(msg);
  }

  private initStockfishWorker() {
    return of(true)
      .pipe(
        switchMap(() => {
          this._uciWorker = new Worker('stockfish/stockfish.js');
          this._uciWorker.onmessage = msg => this._stockfishMsg$.next(msg.data);
          this._uciWorker.postMessage('uci');
          return this.waitMsg(/^uciok$/, 1);
        }),
        switchMap(() => {
          this._uciWorker.postMessage(`setoption name MultiPV value ${MULTI_PV}`);
          this._uciWorker.postMessage('isready');
          return this.waitMsg(/^readyok$/, 1);
        }),
        tap(() => this._uciWorker.postMessage('ucinewgame')),
        mapTo(true),
        shareReplay(1),
      );
  }

  private waitMsg(regExp: RegExp, count: number = null): Observable<string> {
    let out = this._stockfishMsg$.asObservable()
      .pipe(
        filter(msg => regExp.test(msg)),
      );
    if (count !== null) out = out.pipe(take(count));
    return out;
  }
}
