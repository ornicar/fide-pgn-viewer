import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Move } from '../../../chess-core/models/move.model';
import { DomHelper } from '../../../shared/helpers/dom.helper';

@Component({
  selector: 'timeline-slider',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './timeline-slider.component.html',
  styleUrls: ['./timeline-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineSliderComponent implements AfterContentChecked {
  @Input() moves: Move[] = [];
  @Input() selectedMove: Move | null = null;
  @Input() isLive = false;
  @Input() sliderWidth: number;

  @Output() sliderChanged = new EventEmitter();

  @ViewChild('livePosition', { read: ElementRef, static: false }) livePosition: ElementRef;

  get value() {
    return (this.moves || []).indexOf(this.selectedMove);
  }

  get max() {
    return Math.max(0, (this.moves || []).length - 1);
  }

  isShowLiveNumberTooltip = false;

  currentPositionFormatter = {
    to: (value: number): string => {
      const move = this.getMoveByValue(value);

      return move ? move.move_number.toString() : '';
    }
  };

  constructor(
    private elementRef: ElementRef
  ) {
  }

  private getMoveByValue(value) {
    return this.moves[Math.round(value)];
  }

  private updateLiveNumberTooltipVisibility(): void {
    const liveNumberTooltip = this.elementRef.nativeElement.querySelector('.noUi-tooltip');

    if (liveNumberTooltip && this.livePosition) {
      const isOverlapped = DomHelper.isOverlapped(this.livePosition.nativeElement, liveNumberTooltip);

      this.isShowLiveNumberTooltip = this.value !== this.max && !isOverlapped;
    }
  }

  onSliderChange(value): void {
    const move = this.getMoveByValue(value);

    if (move) {
      this.sliderChanged.emit(move);
    }
  }

  ngAfterContentChecked() {
    if (this.value !== this.max) {
      this.updateLiveNumberTooltipVisibility();
    }
  }
}
