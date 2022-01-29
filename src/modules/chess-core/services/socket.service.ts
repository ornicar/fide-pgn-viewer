import { Injectable } from '@angular/core';
import { IMovePosition, IPrediction, Move } from '../models/move.model';
import { Observable, Subject } from 'rxjs';
import { filter, map, take, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { Board, IBoardData } from '../models/board.model';
import { io } from 'socket.io-client';
import { environment } from '@env';

export enum SocketEvents {
  MOVE = 'MOVE',
  MOVE_UPDATE = 'MOVE_UPDATE',
  BOARD = 'BOARD',
  PREDICTION = 'PREDICTION',
  CHANGE_PREDICTION_ENGINE = 'CHANGE_PREDICTION_ENGINE',
}

export interface ISocketMessage {
  eventName: SocketEvents;
  data: any;
}

export interface IMessageNewMove extends ISocketMessage {
  eventName: SocketEvents;
  moves: Move[];
  deleted_moves_ids?: number[];
}

export interface IMessageBoard extends ISocketMessage {
  board: Board;
}

interface ISocketData<T> {
  data: T;
}

interface ISocketDataBoard {
  board: IBoardData;
}

@Injectable()
export class SocketService {
  private _messages$ = new Subject<ISocketMessage>();
  private _connected$ = new Subject<boolean>();
  public readonly connectStatus$ = this._connected$.asObservable()
    .pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );
  private socket;

  private messages$ = this._messages$.asObservable();

  constructor() {
    this.initSocketIO();
  }

  protected initSocketIO() {
    this.connectStatus$.subscribe().unsubscribe();
    this.socket = io(
      environment.socket,
      {
        transports: ['websocket'],
      },
    );

    this.socket.on('connect', () => {
      console.log('WS: connect', this.socket.sendBuffer);
      this._connected$.next(true);
    });
    this.socket.on('connect_error', (err) => {
      console.error('WS: connect ERROR', err);
      this._connected$.next(false);
    });
    this.socket.on('disconnect', (reason) => {
      console.log(`WS: DISCONNECTED`);
      this._connected$.next(false);
      switch (reason) {
        case 'io server disconnect':
          console.assert('WS: disconnected by SERVER');
          break;
      }
    });
    this.socket.onAny((event, ...args) => {
      console.log(`[socket] event`, event, args);
      this._messages$.next({
        eventName: event,
        data: args[0].data,
      });
    });
  }

  connectToWidget(widgetId: number) {
    this.connectStatus$
      .pipe(
        filter(status => status),
        take(1),
      )
      .subscribe(() => {
        this.socket.emit('join', { room: `widget-${widgetId}` });
        console.log(`WS: join to widget [${widgetId}]`);
      });
  }

  on<T>(eventName): Observable<T> {
    return this.messages$
      .pipe(
        filter(msg => msg.eventName === eventName),
        map(msg => msg.data as T),
      );
  }
}
