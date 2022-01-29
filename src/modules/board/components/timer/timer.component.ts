import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import * as moment from 'moment';
import { interval } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

const timer$ = interval(100);

@Component({
  selector: 'timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerComponent {

  @Input() format: string;

  @Input() date: string;

  @Input() stopAfterZero = true;

  @Input() stopTrim: string = null;

  countdown$ = timer$
    .pipe(
      map(() => this.calcCountDown()),
      distinctUntilChanged(),
    );

  private get settings(): moment.DurationFormatSettings {
    return this.stopTrim ? { stopTrim: this.stopTrim } : { trim: false };
  }

  constructor() { }

  private calcCountDown() {
    let countdownMs = moment(this.date).diff(moment());

    if (countdownMs > 0) {
    } else if (this.stopAfterZero) {
      countdownMs = 0;
    } else {
      countdownMs = Math.abs(countdownMs);
    }

    return moment.duration(countdownMs).format(this.format, this.settings);
  }
}
