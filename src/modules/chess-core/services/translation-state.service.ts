import { Injectable } from '@angular/core';
import { ChessApiService } from './chess-api.service';
import { IMoveData, Move, START_FEN } from '../models/move.model';
import { Observable, Subject } from 'rxjs';
import { Board, BoardStatus, Color, IBoardData } from '../models/board.model';
import { filter, map, pairwise, shareReplay, take } from 'rxjs/operators';
import { ISocketMessage, SocketEvents, SocketService } from './socket.service';
import { compareOrderMove, sortMovies, syncFromPosition } from '@modules/chess-core/utils/move-utils';

interface ISocketDataMoves {
  moves: IMoveData[];
  deleted_moves_ids?: number[];
}

interface IStoredMessage {
  event: SocketEvents;
  data: ISocketDataMoves;
}

export interface IUpdateMoves {
  [key: number]: Move | null;
}

@Injectable()
export class TranslationStateService {
  private _moves: Move[] = [];
  private _currentMoveId: number | null = null;
  private _currentMoveId$ = new Subject<number | null>();
  private _currentPosition$ = this._currentMoveId$
    .pipe(
      map(id => this._moves.find(m => m.id === id) || null),
      shareReplay(1)
    );
  private _board = new Subject<Board>();
  private _updateMoves$ = new Subject<IUpdateMoves>();
  private _isTmpState = false;
  private _widgetId: number;
  private _history$ = new Subject<void>();
  private _startTimeout;
  private _loadLostMovesInProgress = false;
  private _storedMessages: ISocketMessage[] = [];

  public board$: Observable<Board> = this._board.asObservable()
    .pipe(shareReplay(1));
  public currentPosition$: Observable<Move> = this._currentPosition$
    .pipe(shareReplay(1));
  public isWhiteTurn$: Observable<boolean> = this.currentPosition$
    .pipe(map(p => p.fen.split(' ')[1] === 'w'));
  public history$: Observable<Move[]> = this._history$.asObservable()
    .pipe(
      map(() => this._moves),
      shareReplay(1),
    );
  public updateMoves$ = this._updateMoves$.asObservable();

  constructor(
    private chessApiService: ChessApiService,
    private socketService: SocketService
  ) {
    this.board$.subscribe().unsubscribe();
    this.history$.subscribe().unsubscribe();
    this._currentPosition$.subscribe().unsubscribe();
  }

  get historyMoves(): Move[] {
    return this._moves;
  }

  get widgetId() {
    return this._widgetId;
  }

  setBoardId(boardId: number) {
    this._widgetId = boardId;
    this.reset();
    this.createSocketConnection();
    this.chessApiService.getBoard(boardId)
      .subscribe(b => this.updateBoard(b));
    this.chessApiService.getMoves(this._widgetId)
      .subscribe(moves => this.addMoves(moves));
  }

  getLastMoveFor(color: Color): Move | null {
    for (let i = this._moves.length - 1; i >= 0; i--) {
      if (this._moves[i].color === color) return this.historyMoves[i];
    }
    return null;
  }

  private addMoves(moves: Move[]) {
    if (!moves.length) {
      this._history$.next();
      return;
    }
    const startFen = this._moves.length > 0 ? this._moves[this._moves.length - 1].fen : START_FEN;
    const sortedMoves = sortMovies(moves) as Move[];
    syncFromPosition(startFen, sortedMoves);
    this._moves.push(...sortedMoves);
    // Move cursor to last MOVE
    this._history$.next();
    this.setMoveId(sortedMoves[sortedMoves.length - 1].id);
  }

  private reset() {
    this._moves = [];
  }

  private setMoveId(id: number | null) {
    this._currentMoveId = id;
    this._currentMoveId$.next(id);
  }

  private createSocketConnection() {
    this.socketService.on<ISocketDataMoves>(SocketEvents.MOVE)
      .subscribe((data) => {
        if (this._loadLostMovesInProgress) {
          this._storedMessages.push({
            data,
            eventName: SocketEvents.MOVE,
          });
        } else {
          this.onNewMoves(data);
        }
      });

    this.socketService.on<ISocketDataMoves>(SocketEvents.MOVE_UPDATE)
      .subscribe((data) => {
        if (this._loadLostMovesInProgress) {
          this._storedMessages.push({
            data,
            eventName: SocketEvents.MOVE_UPDATE,
          });
        } else {
          this.onUpdateMoves(data);
        }
      });

    this.socketService.on<{ board: IBoardData }>(SocketEvents.BOARD)
      .pipe(
        map(data => new Board(data.board)),
      )
      .subscribe(board => this.updateBoard(board));

    this.connectToSocket();
  }

  private onNewMoves(data: ISocketDataMoves) {
    const moves = data.moves.map(m => new Move(m));
    let updateRes: IUpdateMoves = {};
    if (moves.length) {
      updateRes = this.insertMoves(moves);
    }
    if (data.deleted_moves_ids) {
      updateRes = this.deleteMoves(data.deleted_moves_ids, updateRes);
    }
    this.emitUpdateMoves(updateRes);
  }

  private onUpdateMoves(data: ISocketDataMoves) {
    const moves = data.moves.map(m => new Move(m));
    this.updateMoves(moves);
  }

  private connectToSocket() {
    this.socketService.connectToWidget(this._widgetId);
    this.catchReconnect();
  }

  private insertMoves(moves: Move[]): IUpdateMoves {
    const out = {};
    if (!moves.length) return out;

    const sortedMoves = sortMovies(moves) as Move[];
    let cursorNewIdx = 0;
    let cursorOldIdx = 0;
    const movesResult: Move[] = [];

    // Merge sorted moves list
    while (cursorOldIdx <= this._moves.length - 1 || cursorNewIdx <= sortedMoves.length - 1) {
      const orderDir = this._moves[cursorOldIdx] && sortedMoves[cursorNewIdx]
        ? compareOrderMove(this._moves[cursorOldIdx], sortedMoves[cursorNewIdx])
        : this._moves[cursorOldIdx] ? -1 : 1;
      if (orderDir === -1) {
        movesResult.push(this._moves[cursorOldIdx]);
        cursorOldIdx++;
      } else if (orderDir === 1) {
        movesResult.push(sortedMoves[cursorNewIdx]);
        cursorNewIdx++;
      } else {
        out[this._moves[cursorOldIdx].id] = sortedMoves[cursorNewIdx];
        movesResult.push(sortedMoves[cursorNewIdx]);
        cursorOldIdx++;
        cursorNewIdx++;
      }
    }

    this._moves = movesResult;
    syncFromPosition(START_FEN, this._moves);

    return out;
  }

  private updateBoard(board: Board) {
    if (board.status === BoardStatus.EXPECTED) {
      const msToStart = new Date(board.start_datetime).getTime() - new Date().getTime();
      if (msToStart < 1) {
        // If board start time is pass
        board.status = BoardStatus.GOES;
      } else {
        // If board start time in future then wait for update status
        if (this._startTimeout) clearTimeout(this._startTimeout);
        this._startTimeout = setTimeout(() => {
          board.status = BoardStatus.GOES;
          this._board.next(board);
        }, msToStart);
      }
    } else {
      if (this._startTimeout) clearTimeout(this._startTimeout);
    }
    this._board.next(board);
  }

  private emitUpdateMoves(updData: IUpdateMoves) {
    this._history$.next();

    if (Object.keys(updData).length) {
      this._updateMoves$.next(updData);
    }

    if (this._moves.length === 0) {
      this.setMoveId(null);
      return;
    }

    const lastMoveId = this._moves[this._moves.length - 1].id;
    if (this._currentMoveId !== lastMoveId) {
      this.setMoveId(lastMoveId);
    }
  }

  private deleteMoves(deleteIds: number[], updateMoves: IUpdateMoves): IUpdateMoves {
    this._moves = this._moves.filter(m => !deleteIds.includes(m.id));
    deleteIds.forEach((deleteId) => {
      if (!updateMoves[deleteId]) updateMoves[deleteId] = null;
    });
    return updateMoves;
  }

  private updateMoves(moves: Move[]) {
    const updData: IUpdateMoves = {};
    moves.forEach((move) => {
      const moveIdx = this._moves.findIndex(m => m.id === move.id);
      if (moveIdx !== -1) {
        this._moves[moveIdx] = move;
        updData[move.id] = move;
      }
    });
    if (Object.keys(updData).length > 0) {
      syncFromPosition(START_FEN, this._moves);
      this.emitUpdateMoves(updData);
    }
  }

  private catchReconnect() {
    this.socketService.connectStatus$
      .pipe(
        pairwise(),
        filter(([prevStatus, currStatus]) => !prevStatus && currStatus),
        take(1),
      )
      .subscribe(() => {
        this.connectToSocket();
        this.loadLostMovies();
      });
  }

  private async loadLostMovies() {
    this._loadLostMovesInProgress = true;
    const moves = await this.chessApiService.getMoves(this._widgetId).toPromise();
    const newMoves = moves
      .filter(move => this._moves.findIndex(m => m.id === move.id) === -1);
    this.addMoves(newMoves);
    this.emitStoredMessages();
    this._loadLostMovesInProgress = false;
  }

  private emitStoredMessages() {
    this._storedMessages
      .forEach((msg) => {
        switch (msg.eventName) {
          case SocketEvents.MOVE:
            this.onNewMoves(msg.data);
            break;
          case SocketEvents.MOVE_UPDATE:
            this.onUpdateMoves(msg.data);
            break;
        }
      });
    this._storedMessages = [];
  }
}
