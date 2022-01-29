import { ChangeDetectionStrategy, Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, mapTo, shareReplay, startWith, throttleTime } from 'rxjs/operators';
import { TranslationStateService } from '../../chess-core/services/translation-state.service';
import { GameStateService } from '../../chess-core/services/game-state.service';
import { SubscriptionHelper, Subscriptions } from '../../shared/helpers/subscription.helper';
import { OnChangesObservable } from '../../shared/decorators/observable-input';
import { Move } from '../../chess-core/models/move.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'broadcast-timeline',
  templateUrl: './broadcast-timeline.component.html',
  styleUrls: ['./broadcast-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BroadcastTimelineComponent implements OnInit, OnDestroy {
  sliderWidth: number;

  readonly maxSliderWidth = 200;
  readonly valueForFixedSlider = 80;

  selectedTranslationMove$: Observable<Move> = this.gameState.selectedMove$
    .pipe(
      filter(move => !move || !move.user_move)
    );

  moves$: Observable<Move[]> = this.translationState.history$
    .pipe(
      throttleTime(10, undefined, { leading: true, trailing: true }),
      shareReplay(1)
    );

  hasMoves$: Observable<boolean> = this.moves$.pipe(map(moves => moves.length > 0));

  scores$ = this.moves$
    .pipe(
      throttleTime(10, undefined, { leading: true, trailing: true }),
      map(moves => moves.map(move => move.stockfish_score || 0)),
    );

  private subs: Subscriptions = {};

  constructor(
    private translationState: TranslationStateService,
    public gameState: GameStateService
  ) {
  }

  ngOnInit() {
    this.subs.moves = this.moves$
      .pipe(
        map(moves => moves.length),
        distinctUntilChanged()
      )
      .subscribe(max => this.updateSliderWidth(max));
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  updateSliderWidth(max): void {
    let width = this.maxSliderWidth;

    if (max < this.valueForFixedSlider) {
      width = Math.round(this.maxSliderWidth / this.valueForFixedSlider * max);
    }

    this.sliderWidth = Math.min(this.maxSliderWidth, width);
  }

  sliderChanged(move: Move) {
    this.gameState.selectMoveFromHistory(move);
  }
}
