import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import { SubscriptionHelper, Subscriptions } from '../../shared/helpers/subscription.helper';
import { IMovePosition } from '../../chess-core/models/move.model';
import { BoardTooltipService } from '../../chess-core/services/board-tooltip.service';

@Component({
  selector: 'predictions-line',
  templateUrl: './predictions-line.component.html',
  styleUrls: ['./predictions-line.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PredictionsLineComponent implements OnDestroy {
  @Input() score: number;
  @Input() engine: number;
  @Input() predictions: IMovePosition[] = [];
  @Input() selectedPrediction: IMovePosition;
  @Input() fromPosition: IMovePosition;
  @Input() depth: number;
  @Input() nps: number;

  @Output() predictionChange = new EventEmitter<IMovePosition>();

  private hasCurrentPredictPosition = false;

  private prevPrediction?: IMovePosition;
  private nextPrediction?: IMovePosition;

  private subs: Subscriptions = {};

  trackBySan(index, move: IMovePosition) {
    return `${move.san}&${move.fen}`;
  }

  constructor(
    private ngZone: NgZone,
    private boardTooltipService: BoardTooltipService,
    private cdr: ChangeDetectorRef,
  ) {}

  private subscribeKeyboardEvents() {
    // if (!this.subs.onLeft) {
    //   this.subs.onLeft = fromEvent(MousetrapHelper.eventTargetLike(this.ngZone), 'left')
    //     .pipe(throttleTime(100))
    //     .subscribe(() => {
    //       if (this.prevPrediction) {
    //         this.predictionChange.next(this.prevPrediction);
    //       }
    //     });
    // }
    //
    // if (!this.subs.onRight) {
    //   this.subs.onRight = fromEvent(MousetrapHelper.eventTargetLike(this.ngZone), 'right')
    //     .pipe(throttleTime(100))
    //     .subscribe(() => {
    //       if (this.nextPrediction) {
    //         this.predictionChange.next(this.nextPrediction);
    //       }
    //     });
    // }
  }

  private unsubscribeKeyboardEvents() {
    // if (this.subs.onLeft) {
    //   this.subs.onLeft.unsubscribe();
    //   delete this.subs.onLeft;
    // }
    //
    // if (this.subs.onRight) {
    //   this.subs.onRight.unsubscribe();
    //   delete this.subs.onRight;
    // }
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  moveClick(position: IMovePosition) {
    this.predictionChange.next(position);
  }

  onPrevMove($event) {
    $event.preventDefault();

    if (this.prevPrediction) {
      this.predictionChange.next(this.prevPrediction);
    }
  }

  onNextMove($event) {
    $event.preventDefault();

    if (this.nextPrediction) {
      this.predictionChange.next(this.nextPrediction);
    }
  }

  showTooltip($event: MouseEvent, move: IMovePosition) {
    const moveIdx = this.predictions.findIndex(m => m.fen === move.fen);
    let position = this.fromPosition.fen;
    if (moveIdx > 0) {
      position = this.predictions[moveIdx - 1].fen;
    }
    this.boardTooltipService.displayTooltip({
      position,
      element: $event.target as HTMLElement,
      moveSan: move.san,
      isHeaderHidden: true,
    });
  }

  hideTooltip() {
    this.boardTooltipService.hideTooltip();
  }

}
