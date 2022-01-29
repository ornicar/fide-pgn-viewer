import { Injectable } from '@angular/core';
import { FigureSymbols, IMovePosition, Move, START_FEN } from '../models/move.model';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators';
import { IUpdateMoves, TranslationStateService } from './translation-state.service';
import * as moment from 'moment';
import { TFigure } from '../../board/components/chess-board/figure.model';
import { syncFromPosition } from '@modules/chess-core/utils/move-utils';

const STARTED_MOVE_ID = 0;

@Injectable()
export class GameStateService {
  public board$ = this.translationService.board$;

  private _isTranslation$ = new BehaviorSubject(true);
  public isTranslation$ = this._isTranslation$.asObservable()
    .pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );

  private _isMyGame$ = new BehaviorSubject(false);
  public isMyGame$ = this._isMyGame$.asObservable()
    .pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );

  private _selectedMove$ = new BehaviorSubject<Move | null>(null);
  public selectedMove$ = this._selectedMove$.asObservable()
    .pipe(
      shareReplay(1)
    );

  public historyToSelected$: Observable<Move[]> = this.selectedMove$
    .pipe(
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
      map((selectedMove) => {
        if (!selectedMove) return [];
        return this.getHistoryToMove(this.translationService.historyMoves, selectedMove);
      }),
      shareReplay(1)
    );

  private _myMoves$ = new BehaviorSubject<Move[]>([]);
  public myMoves$: Observable<Move[]> = this._myMoves$.asObservable()
    .pipe(
      shareReplay(1)
    );

  private _boardPosition$ = new Subject<IMovePosition>();
  public boardPosition$: Observable<IMovePosition> = this._boardPosition$.asObservable()
    .pipe(
      shareReplay(1)
    );

  private _startMyGameFromMoveId: number | null = null;
  private _myMoves: Move[] = [];
  private _myTurnId = -1;

  // private _selectedPrediction: IMovePosition[] = [];

  constructor(
    // private boardService: BoardStateService,
    private translationService: TranslationStateService,
  ) {
    this.isTranslation$.subscribe().unsubscribe();
    this.isMyGame$.subscribe().unsubscribe();
    this.historyToSelected$.subscribe().unsubscribe();
    this.myMoves$.subscribe().unsubscribe();
    this.boardPosition$.subscribe().unsubscribe();
    this.selectedMove$.subscribe().unsubscribe();

    this.selectedMove$
    // .pipe(filter(m => m !== null))
      .subscribe((m) => this.proxyMoveToBoard(m));

    combineLatest([
      this.translationService.currentPosition$,
      this.isTranslation$,
    ])
      .pipe(
        filter(([move, isTranslation]) => isTranslation),
        map(([move, isTranslation]) => move)
      )
      .subscribe(move => this.selectMove(move));

    this.translationService.updateMoves$
      .subscribe(movesUpd => this.trackUpdateMoves(movesUpd));
  }

  get widgetId() {
    return this.translationService.widgetId;
  }

  setBoardId(boardId: number) {
    this.clear();
    this.translationService.setBoardId(boardId);
  }

  selectMoveFromHistory(move: Move | null) {
    const history = this.translationService.historyMoves;
    if (move && history.length > 0) {
      const lastMove = history[history.length - 1];
      if (lastMove.id === move.id) {
        this.enableTranslation();
        return;
      }
    }
    if (!move && !history.length) {
      this.enableTranslation();
      return;
    }

    this._isTranslation$.next(false);
    this.selectMove(move);
  }

  selectMoveFromPrediction(position: IMovePosition, positions: IMovePosition[]) {
    const selectedMoveIdx = positions
      .findIndex(p => p.move_number === position.move_number && p.is_white_move === position.is_white_move);
    if (selectedMoveIdx === -1) return;
    const moves = this.positionsToMoves(positions);
    this.addMyMoves(moves);
    this.selectMove(moves[selectedMoveIdx]);
  }

  createMove(position: IMovePosition) {
    const moves = this.positionsToMoves([position]);
    this.addMyMoves(moves);
    this.selectMove(moves[0]);
  }

  clearMyMoves() {
    if (this._startMyGameFromMoveId === null) return;
    const history = this.translationService.historyMoves;
    if (this._selectedMove$.value?.user_move) {
      const toMove = history.find(move => move.id === this._startMyGameFromMoveId);
      this.selectMoveFromHistory(toMove);
    }
    this._startMyGameFromMoveId = null;
    this._myMoves = [];
    this._isMyGame$.next(false);
    this._myMoves$.next(this._myMoves);
  }

  private addMyMoves(moves: Move[]) {
    if (moves.length === 0) return;
    const selectMove = this._selectedMove$.value;
    if (selectMove === null) {
      // If not selected move
      this._startMyGameFromMoveId = STARTED_MOVE_ID;
    } else {
      if (selectMove.user_move) {
        const selectMoveIdx = this._myMoves
          .findIndex(m => m.id === selectMove.id);
        this._myMoves = this._myMoves.slice(0, selectMoveIdx + 1);
      } else {
        this._startMyGameFromMoveId = selectMove.id;
        this._myMoves = [];
      }
    }
    this.numerableMovies(selectMove, moves);
    this.calcSpentSeconds(moves);
    const startPos = this._myMoves.length
      ? this._myMoves[this._myMoves.length - 1].fen
      : selectMove?.fen || START_FEN;
    syncFromPosition(startPos, moves);
    this._myMoves.push(...moves);
    this._isMyGame$.next(true);
    this._isTranslation$.next(false);
    this._myMoves$.next(this._myMoves);
    // this.selectMove(moves[moves.length - 1]);
  }

  enableTranslation() {
    if (this._isTranslation$.value) return;
    this._isMyGame$.next(false);
    this._isTranslation$.next(true);
    const history = this.translationService.historyMoves;
    const lastMove = history.length ? history[history.length - 1] : null;
    // this._history$.next();
    this.selectMove(lastMove);
  }

  get idStartMyGame(): number | null {
    return this._startMyGameFromMoveId;
  }

  private positionsToMoves(prediction: IMovePosition[]): Move[] {
    return prediction.map((p) => {
      const out = new Move({
        id: this._myTurnId--,
        move_number: 0,
        white_black_move: null,
        fen_move: p.fen,
        piece: (FigureSymbols.includes(p.san[0]) ? p.san[0].toUpperCase() : 'P') as TFigure,
        san_move: p.san,
        timestamp: moment().toISOString(), // used for timers
        stockfish_score: p.stockfish_score,
      });
      out.user_move = true;
      return out;
    });
  }

  private numerableMovies(afterMove: Move, moves: Move[]): Move[] {
    let startNum = afterMove ? afterMove.move_number : 0;
    let startIsWhite = afterMove ? afterMove.is_white_move : false;
    return moves.map((move) => {
      startIsWhite = !startIsWhite;
      if (startIsWhite) {
        startNum++;
      }
      move.move_number = startNum;
      move.is_white_move = startIsWhite;
      return move;
    });
  }

  private selectMove(move: Move | null) {
    // this._selectedPrediction = [];
    this._selectedMove$.next(move);
  }

  private proxyMoveToBoard(move: IMovePosition | null) {
    // this.boardService.setPosition(move);
    this._boardPosition$.next(move);
  }

  private clear() {
  }

  private getHistoryToMove(history: Move[], selectedMove: Move): Move[] {
    const out: Move[] = [];
    if (selectedMove.user_move) {
      // If game started after start translation
      if (this._startMyGameFromMoveId !== STARTED_MOVE_ID) {
        // Get part moves from translation
        out.push(...this.sliceMovesToId(history, this._startMyGameFromMoveId));
      }
      // Get part my Moves, to selected move
      out.push(...this.sliceMovesToId(this._myMoves, selectedMove.id));
    } else {
      // Get part moves, to selected move
      out.push(...this.sliceMovesToId(history, selectedMove.id));
    }
    return out;
  }

  private sliceMovesToId(moves: Move[], id: number): Move[] {
    const out = [];
    let idx = 0;
    while (moves[idx] && moves[idx].id !== id) {
      out.push(moves[idx]);
      idx++;
    }
    if (moves[idx] && moves[idx].id === id) out.push(moves[idx]);
    return out;
  }

  private calcSpentSeconds(newMovies: Move[]) {
    let startTime = this._selectedMove$.value?.created || new Date().toISOString();
    return newMovies
      .map(m => {
        m.seconds_spent = moment.duration(moment(m.created).diff(startTime)).seconds();
        startTime = m.created;
      });
  }

  private trackUpdateMoves(movesUpd: IUpdateMoves) {
    const selectedMove = this._selectedMove$.value;
    if (!selectedMove) return;
    if (movesUpd[selectedMove.id] === undefined) return;
    if (movesUpd[selectedMove.id]) {
      this.selectMove(movesUpd[selectedMove.id]);
    } else {
      const history = this.translationService.historyMoves;
      if (history.length > 0)
        this.selectMove(history[history.length - 1]);
      else
        this.selectMove(null);
    }
  }
}
