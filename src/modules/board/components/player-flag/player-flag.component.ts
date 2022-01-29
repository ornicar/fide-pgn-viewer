import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'player-flag',
  template: `<span class="flag-icon" [class]="'flag-icon ' + (countryCodeClass$ | async)"></span>`,
  styleUrls: [
    './player-flag.component.scss',
    // './flag-icon.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerFlagComponent implements OnChanges, OnDestroy {
  @Input() countryId: number;
  @Input() countryCode: string;
  countryId$ = new BehaviorSubject<number>(null);
  countryCode$ = new BehaviorSubject<string>(null);
  countryCodeClass$ = new BehaviorSubject<string>(null);
  destroy$ = new Subject();

  constructor() {
    this.countryId$.pipe(
      takeUntil(this.destroy$),
      filter(id => !!id),
      map(code => code ? `flag-icon-${code}` : '')
    ).subscribe((className) => {
      this.countryCodeClass$.next(className);
    });

    this.countryCode$.pipe(
      takeUntil(this.destroy$),
      filter(code => !!code),
      map(code => `flag-icon-${code.toLowerCase()}`)
    ).subscribe((className) => {
      this.countryCodeClass$.next(className);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['countryId']) {
      this.countryId$.next(Number(changes['countryId'].currentValue));
    }

    if (changes['countryCode']) {
      this.countryCode$.next(String(changes['countryCode'].currentValue));
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
