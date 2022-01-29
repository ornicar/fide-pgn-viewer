import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { Color } from 'chessground/types';
import { BoardResult } from '../../../chess-core/models/board.model';

@Component({
  selector: 'player-result',
  templateUrl: './player-result.component.html',
  styleUrls: ['./player-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerResultComponent {

  @Input()
  private position: 'top' | 'bottom';

  @Input()
  private playerColor: Color;

  @Input()
  public result: BoardResult;

  get resultValue(): string {
    switch (this.result) {
      case BoardResult.DRAW:
        return '1/2';

      case BoardResult.VICTORY_WHITE:
        return this.playerColor === 'white' ? '1' : '0';

      case BoardResult.VICTORY_BLACK:
        return this.playerColor === 'black' ? '1' : '0';
      case BoardResult.NOTHING:
        return '0';
    }
  }

  @HostBinding('class.white-player')
  get isWhitePlayer() {
    return this.playerColor === 'white';
  }

  @HostBinding('class.black-player')
  get isBlackPlayer() {
    return this.playerColor === 'black';
  }

  @HostBinding('class.top-position')
  get isTopPosition() {
    return this.position === 'top';
  }

  @HostBinding('class.bottom-position')
  get isBottomPosition() {
    return this.position === 'bottom';
  }
}
