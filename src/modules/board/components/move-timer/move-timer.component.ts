import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith } from 'rxjs/operators';
import * as moment from 'moment';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { Board, BoardStatus, Color } from '../../../chess-core/models/board.model';
import { Move } from '../../../chess-core/models/move.model';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
import { GameStateService } from '../../../chess-core/services/game-state.service';
import { TranslationStateService } from '../../../chess-core/services/translation-state.service';

@Component({
  selector: 'move-timer',
  templateUrl: './move-timer.component.html',
  styleUrls: ['./move-timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveTimerComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  playerColor: Color;

  @OnChangesInputObservable()
  playerColor$ = new BehaviorSubject<Color>(this.playerColor);

  @HostBinding('class.white-player')
  get isWhitePlayer() {
    return this.playerColor === 'white';
  }

  isWhitePlayer$ = this.playerColor$.pipe(
    filter(color => Boolean(color)),
    distinctUntilChanged(),
    map(color => color === 'white')
  );

  private board$ = this.translationState.board$;

  private lastMove$: Observable<Move> = this.translationState.currentPosition$
    .pipe(
      filter(v => Boolean(v)),
      startWith(null),
    );

  private leftSeconds$: Observable<number> = combineLatest([
    this.board$,
    this.playerColor$,
    this.lastMove$,
  ])
    .pipe(
      map(([board, playerColor]) => {
        const prevMove = this.translationState.getLastMoveFor(playerColor);
        if (!prevMove) {
          const time = board.getStartLeftTimeFor(playerColor);
          return moment.duration(time).asSeconds();
        }
        return prevMove.seconds_left;
        // if (prevMove.move_number >= board.time_control.constant_increment_move_number) {
        //   out += moment.duration(board.time_control.constant_increment).asSeconds();
        // }
        // if (prevMove.move_number === board.time_control.one_time_increment_move_number) {
        //   out += moment.duration(board.time_control.one_time_increment).asSeconds();
        // }
        // return out;
      }),
    );

  public timers$ = combineLatest([this.lastMove$, this.leftSeconds$, this.board$])
    .pipe(
      debounceTime(1),
      map(([move, seconds, board]) => {
        const created = move ? new Date(move.created) : new Date(board.start_datetime);
        const now = new Date();
        const startTimeDate = now.getTime() - created.getTime() > 0 ? created : now;
        const secondsLeftDate = moment(startTimeDate).add(seconds, 's').toDate();

        return {
          startTimeDate: startTimeDate.toISOString(),
          secondsLeftDate: secondsLeftDate.toISOString()
        };
      })
    );

  public isShowTimer$: Observable<boolean> = combineLatest([
    this.board$,
    this.lastMove$.pipe(startWith(null)),
  ])
    .pipe(
      map(([board, move]) => {
        if (board.status !== BoardStatus.GOES) return false;
        if (!move) return this.playerColor === Color.White;
        return this.playerColor === Color.White ? !move.is_white_move : move.is_white_move;
      })
    );

  public showTimers$: Observable<any>;
  subs: Subscriptions = {};

  constructor(private translationState: TranslationStateService) {
  }

  ngOnInit() {
    this.showTimers$ = this.isShowTimer$
      .pipe(
        mergeMap((isShow) => isShow ? this.timers$ : EMPTY)
      );
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  @OnChangesObservable()
  ngOnChanges(): void {
  }
}
