import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith, switchMap,
  take, withLatestFrom,
} from 'rxjs/operators';
import { GameStateService } from '../chess-core/services/game-state.service';
import { OnChangesObservable } from '../shared/decorators/observable-input';
import { TranslationStateService } from '../chess-core/services/translation-state.service';
import { SubscriptionHelper, Subscriptions } from '../shared/helpers/subscription.helper';
import { Move } from '../chess-core/models/move.model';

enum ShiftDir {
  NEXT,
  PREV,
}

@Component({
  selector: 'broadcast-navigation',
  templateUrl: './broadcast-navigation.component.html',
  styleUrls: ['./broadcast-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BroadcastNavigationComponent implements OnInit, OnChanges, OnDestroy {
  @Output()
  flip = new EventEmitter<void>();
  @Output()
  drawState = new EventEmitter<boolean>();
  drawIsEnabled = false;

  nextMove$ = this.gameState.selectedMove$
    .pipe(
      switchMap((move) => this.getMoveWithShift(move, ShiftDir.NEXT)),
      shareReplay(1),
    );

  prevMove$ = this.gameState.selectedMove$
    .pipe(
      switchMap((move) => this.getMoveWithShift(move, ShiftDir.PREV)),
      shareReplay(1),
    );

  isDisableStart$ = this.gameState.selectedMove$.pipe(
    map(move => move === null),
    startWith(true),
    distinctUntilChanged(),
    shareReplay(1),
  );

  isDisableBack$ = this.prevMove$.pipe(
    startWith(true),
    map(move => move === undefined),
    distinctUntilChanged(),
  );

  isDisableForward$ = this.nextMove$.pipe(
    map(move => move === undefined),
    startWith(true),
    distinctUntilChanged(),
  );

  isDisableEnd$ = this.gameState.selectedMove$.pipe(
    map((move) => {
      if (this.history.length === 0) return true;
      return move && move.id === this.history[this.history.length - 1].id;
    }),
    startWith(true),
    distinctUntilChanged(),
    shareReplay(1),
  );

  private subs: Subscriptions = {};

  constructor(
    public gameState: GameStateService,
    public translationState: TranslationStateService,
  ) { }

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges() {
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  onFlipClick(): void {
    this.flip.next();
  }

  onBackwardClick(): void {
    this.prevMove$
      .pipe(
        take(1),
        filter((move) => move !== undefined),
      )
      .subscribe(move => this.gameState.selectMoveFromHistory(move));
  }

  onForwardClick(): void {
    this.nextMove$
      .pipe(
        take(1),
        filter((move) => move !== undefined),
      )
      .subscribe(move => this.gameState.selectMoveFromHistory(move));
  }

  onStartClick(): void {
    this.isDisableStart$
      .pipe(
        take(1),
        filter(disabled => !disabled),
      )
      .subscribe(() => this.gameState.selectMoveFromHistory(null));
  }

  onEndClick(): void {
    combineLatest([
      this.translationState.history$,
      this.isDisableEnd$,
    ])
      .pipe(
        take(1),
        filter(([history, disabled]) => !disabled),
        map(([history]) => history[history.length - 1]),
      )
      .subscribe(move => this.gameState.selectMoveFromHistory(move));
  }

  private get history(): Move[] {
    return this.translationState.historyMoves;
  }

  toggleDrawArrow() {
    this.drawIsEnabled = !this.drawIsEnabled;
    this.drawState.emit(this.drawIsEnabled);
  }

  /**
   * Return move with shift
   * if shift to start position - return NULL
   * if shift out of range - return UNDEFINED
   * @param move - target move
   * @param shift - shift directory
   */
  private getMoveWithShift(move: Move, shift: ShiftDir): Observable<Move | null | undefined> {
    return combineLatest([
      this.translationState.history$,
      this.gameState.myMoves$,
    ])
      .pipe(
        take(1),
        map(([history, myMoves]) => {
          // if selected start board position
          if (!move) {
            if (shift === ShiftDir.NEXT && history.length) return history[0];
            return undefined;
          }
          // if selected move start myGame and shift to NEXT, return first move my game
          if (this.gameState.idStartMyGame === move.id && shift === ShiftDir.NEXT && myMoves.length) {
            return myMoves[0];
          }
          // If selected first my game and shift to PREV, return move start my game
          if (move.user_move) {
            const myIdx = myMoves.findIndex(m => m.id === move.id);
            if (myIdx === 0 && shift === ShiftDir.PREV) {
              return history.find(m => m.id === this.gameState.idStartMyGame);
            }
          }
          const source = move.user_move ? myMoves : history;
          const mod = shift === ShiftDir.PREV ? -1 : 1;
          const idx = source.findIndex(m => m.id === move.id);
          // If selected first move^ can move to start position
          if (idx === 0 && shift === ShiftDir.PREV) return null;
          return source[idx + mod];
        })
      );
  }
}
