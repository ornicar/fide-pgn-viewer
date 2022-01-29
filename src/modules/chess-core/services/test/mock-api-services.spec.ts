import { Injectable } from '@angular/core';
import { ChessApiService } from '../chess-api.service';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { Board } from '../../models/board.model';
import { getMockBoard, getMockMoves } from './mocks.spec';
import { Move } from '../../models/move.model';
import { ISocketMessage, SocketService } from '../socket.service';
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators';

function getDefCounters() {
  return {
    board: 0,
    moves: 0,
    prediction: 0,
    wsMoves: 0
  };
}

export let requestCounters = getDefCounters();

export function resetCounters() {
  requestCounters = getDefCounters();
}

@Injectable()
export class MockChessApiService extends ChessApiService {
  getBoard(id): Observable<Board> {
    requestCounters.board++;
    return of(getMockBoard(id));
  }

  getMoves(boardId): Observable<Move[]> {
    requestCounters.moves++;
    return of(getMockMoves(boardId));
  }
}

@Injectable()
export class MockSocketService extends SocketService {
  private msg$ = new Subject<ISocketMessage>();
  public widgetId;

  private connectState$ = new Subject<boolean>();
  connectStatus$ = this.connectState$.asObservable()
    .pipe(
      distinctUntilChanged(),
      shareReplay(),
    );

  constructor() {
    super();
  }

  protected initSocketIO() {
    this.connectStatus$.subscribe().unsubscribe();
  }

  connectToWidget(boardId: number) {
    this.widgetId = boardId;
    requestCounters.wsMoves++;
  }

  on<T>(eventName): Observable<T> {
    return this.msg$.asObservable()
      .pipe(
        filter(msg => msg.eventName === eventName),
        map(msg => msg.data as T)
      );
  }

  emit(msg: ISocketMessage) {
    this.msg$.next(msg);
  }

  reconnect() {
    this.connectState$.next(false);
    setTimeout(() => this.connectState$.next(true), 50);
  }
}
