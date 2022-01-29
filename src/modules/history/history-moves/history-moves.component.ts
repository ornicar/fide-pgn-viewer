import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Input, OnDestroy,
  OnInit,
} from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { delay, map, shareReplay, } from 'rxjs/operators';
import { GameStateService } from '../../chess-core/services/game-state.service';
import { Move } from '../../chess-core/models/move.model';
import { SubscriptionHelper, Subscriptions } from '../../shared/helpers/subscription.helper';
import { TranslationStateService } from '../../chess-core/services/translation-state.service';
import { BoardTooltipService } from '../../chess-core/services/board-tooltip.service';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { Board, BoardResult, BoardStatus } from '@modules/chess-core/models/board.model';

interface IHistoryBlock {
  moves?: Move[];
  my_moves?: Move[][];
}

@Component({
  selector: 'history-moves',
  templateUrl: './history-moves.component.html',
  styleUrls: ['./history-moves.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryMovesComponent implements OnInit, OnDestroy {
  @Input()
  public hiddenTooltip = false;

  public selectedMove: Move;
  public selectedMove$ = this.gameState.selectedMove$;

  historyBlocks$: Observable<IHistoryBlock[]> = combineLatest([
    this.translationState.history$,
    this.gameState.myMoves$,
  ])
    .pipe(
      map(([history, myMoves]) => this.formatGroups(history, myMoves)),
      shareReplay(1),
    );

  notification$: Observable<string> = combineLatest([
    this.gameState.selectedMove$,
    this.gameState.board$,
  ])
    .pipe(
      map(([selectMove, board]) => this.notificationMessage(board, selectMove))
    );

  private subs: Subscriptions = {};

  constructor(
    private cd: ChangeDetectorRef,
    public gameState: GameStateService,
    public translationState: TranslationStateService,
    public boardTooltipService: BoardTooltipService,
  ) {
  }

  ngOnInit() {
    this.initDetectNewMoves();
  }

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  private initDetectNewMoves() {
    this.subs.selectedMove = this.selectedMove$
      .subscribe(selectedMove => {
        this.selectedMove = selectedMove;
        this.cd.detectChanges();
      });
    this.subs.updateMoves = this.historyBlocks$
      .pipe(delay(10))
      .subscribe(() => this.cd.detectChanges());
  }

  onMoveClick(move: Move) {
    this.gameState.selectMoveFromHistory(move);
  }

  trackByBlock(index, block: IHistoryBlock) {
    if (block.moves) {
      return `${block.moves[0]?.id || 0}-${block.moves[1]?.id || 0}`;
    } else {
      return `my-moves-${block.my_moves[0][0].id}`;
    }
  }

  trackByMove(index, item) {
    return item;
  }

  getMoveNumber(moveGroup: Move[]) {
    return moveGroup[0]?.move_number || moveGroup[1]?.move_number;
  }

  displayTooltip($event: MouseEvent, move: Move) {
    if (!move || this.hiddenTooltip) return;
    const duration = new DurationPipe()
      .transform(move.seconds_spent * 1000, 'HH:mm:ss', { stopTrim: 'm s' });
    this.boardTooltipService.displayTooltip({
      position: move.from_fen ? move.from_fen : move.fen,
      moveSan: move.from_fen ? move.san : null,
      element: $event.target as HTMLElement,
      stockfishScore: move.stockfish_score,
      leftTime: duration
    });
  }

  hideTooltip() {
    this.boardTooltipService.hideTooltip();
  }

  private formatGroups(translationMoves: Move[], myMoves: Move[]): IHistoryBlock[] {
    const out: IHistoryBlock[] = this.groupedMoves(translationMoves)
      .map(group => ({ moves: group }));
    const startId = this.gameState.idStartMyGame;

    if (startId === null) return out;

    const idxGroup = out
      .findIndex(group => [group.moves[0]?.id, group.moves[1]?.id].includes(startId));

    // If create my game from translation position
    if (idxGroup !== -1) {
      const startGroup = out[idxGroup].moves;
      // If start my game from WHITE move
      if (startGroup[0]?.id === startId) {
        out[idxGroup] = { moves: [startGroup[0], null] };
        // If block has BLACK, move BLACK to next block
        if (startGroup[1]) {
          // out[idxGroup + 1] = { moves: [null, startGroup[1]] };
          out.splice(idxGroup + 1, 0, { moves: [null, startGroup[1]] });
        }
      }
    }
    if (myMoves.length) {
      const my_moves = this.groupedMoves(myMoves)
        .map(group => group.filter(item => !!item));
      out.splice(idxGroup + 1, 0, { my_moves });
    }

    return out;
  }

  private groupedMoves(moves: Move[]): Move[][] {
    const groupedMoves = [];
    let i = 0;

    while (i < moves.length) {
      let [white, black] = moves.slice(i, i + 2);

      // set only a black move when a white move is missed.
      if (!white.is_white_move) {
        [white, black] = [null, white];
      }
      // set only a white move when a black move is missed.
      if (black && black.is_white_move) {
        black = null;
      }

      groupedMoves.push([white, black]);

      // go to next pair only when we have white and black moves.
      i += white && black ? 2 : 1;
    }

    return groupedMoves;
  }

  private notificationMessage(board: Board, move: Move): string {
    if (board.status === BoardStatus.EXPECTED) return 'GAME WILL START SOON';
    if (board.status === BoardStatus.COMPLETED) {
      switch (board.result) {
        case BoardResult.VICTORY_BLACK:
          return 'BLACK VICTORY';
        case BoardResult.VICTORY_WHITE:
          return 'WHITE VICTORY';
        case BoardResult.DRAW:
          return 'DRAW';
        case BoardResult.STALEMATE:
          return 'STALEMATE';
        default:
          return 'GAME IS COMPLETED';
      }
    }
    if (!move) return `WHITE TO MOVE`;
    if (/\+/.test(move.san)) return 'CHECK';
    const color = move.is_white_move ? 'BLACK' : 'WHITE';
    return `${color} TO MOVE`;
  }

  clearMyMoves() {
    this.gameState.clearMyMoves();
  }
}
