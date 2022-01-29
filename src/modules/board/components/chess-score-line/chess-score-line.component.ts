import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Color } from 'chessground/types';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';

@Component({
  selector: 'stockfish-score-line',
  templateUrl: './chess-score-line.component.html',
  styleUrls: ['./chess-score-line.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessScoreLineComponent implements OnChanges {

  @Input()
  moveScore = 0;

  @OnChangesInputObservable()
  moveScore$ = new BehaviorSubject<number>(this.moveScore);

  @Input()
  bottomPlayerColor: Color = 'white';

  @Input()
  myGameIsActive = false;

  // Upper limit of score.
  readonly MAX_SCORE = 4;

  // calculate percentage. From minus 1 to plus 1.
  percentage$ = this.moveScore$.pipe(
    map(score => {
      if (score >= this.MAX_SCORE) {
        return 1;
      } else if (score <= -this.MAX_SCORE) {
        return -1;
      } else {
        return score / this.MAX_SCORE;
      }
    })
  );

  constructor() { }

  isInvert() {
    return this.bottomPlayerColor !== 'white';
  }

  @OnChangesObservable()
  ngOnChanges() {
  }
}
