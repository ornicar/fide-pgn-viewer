import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { Board, Color } from '../../../chess-core/models/board.model';
import { IPlayer } from '../../../chess-core/models/player.model';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent implements OnChanges {
  @Input()
  playerColor: Color;

  @OnChangesInputObservable()
  playerColor$ = new BehaviorSubject<Color>(this.playerColor);

  @Input()
  board: Board;

  @OnChangesInputObservable()
  board$ = new BehaviorSubject<Board>(this.board);

  player$: Observable<IPlayer> = combineLatest(this.board$, this.playerColor$).pipe(
    filter(([board, playerColor]) => Boolean(board && playerColor)),
    map(([board, playerColor]) => board.players[playerColor]),
  );

  @HostBinding('class.white-player')
  get isWhitePlayer() {
    return this.playerColor === 'white';
  }

  @OnChangesObservable()
  ngOnChanges() {}
}
