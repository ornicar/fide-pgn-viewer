import { Injectable } from '@angular/core';
import { IMovePosition, START_FEN } from '../models/move.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { GameStateService } from './game-state.service';

export const START_BOARD_POSITION: IMovePosition = {
  fen: START_FEN,
  stockfish_score: 0,
  san: null,
  is_white_move: true,
  move_number: 0,
};

@Injectable()
export class BoardStateService {
  private _currentPosition$ = new BehaviorSubject<IMovePosition>(START_BOARD_POSITION);
  public currentPosition$: Observable<IMovePosition> = this._currentPosition$.asObservable()
    .pipe(shareReplay(1));
  public isWhiteTurn$: Observable<boolean> = this.currentPosition$
    .pipe(
      map(p => p.fen.split(' ')[1] === 'w')
    );

  constructor(
    private gameState: GameStateService
  ) {
    this.currentPosition$.subscribe().unsubscribe();
    this.gameState.boardPosition$
      // .pipe(filter(m => m !== null))
      .subscribe((p) => {
        this._currentPosition$.next(p || START_BOARD_POSITION);
      });
  }
}
