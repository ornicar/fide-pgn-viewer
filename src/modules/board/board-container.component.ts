import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding, Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { GameStateService } from '../chess-core/services/game-state.service';
import { BoardStateService } from '../chess-core/services/board-state.service';
import { Board, BoardResult, Color } from '../chess-core/models/board.model';
import { SubscriptionHelper, Subscriptions } from '../shared/helpers/subscription.helper';
import { filter, map, shareReplay, skip, startWith, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { PredictionsService } from '../predictions/services/predictions.service';
import { ChessBoardComponent } from './components/chess-board/chess-board.component';
import { IMovePosition, Move } from '../chess-core/models/move.model';
import * as Chess from 'chess.js';
import { CapturedPiecesType, getStartCapturedPieces } from './models/captured-pieces.interface';

@Component({
  selector: 'board-container',
  templateUrl: './board-container.component.html',
  styleUrls: ['./board-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardContainerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public hiddenCapturedPieces = false;

  private defaultBottomPlayerColor: Color = Color.White;
  Color = Color;
  public boardPxSize: number;
  public orientation = Color.White;

  public stockfishScore$: Observable<number> = this.boardState.currentPosition$
    .pipe(
      skip(1), // skip evaluating start position
      switchMap((position) => {
        if (position.stockfish_score === undefined) // My move
          return this.evaluatePositionScore(position);
        return of(position.stockfish_score);
      }),
      filter(score => score !== null), // wait update score by MOVE_UPDATE
      startWith(0),
    );

  public capturedPieces$: Observable<CapturedPiecesType> = this.gameState.historyToSelected$
    .pipe(
      map((moves: Move[]) => this.calcCapturedPieces(moves)),
      shareReplay(1),
    );

  public whiteResult$: Observable<string> = this.gameState.board$
    .pipe(
      map(board => this.getResultText(board, Color.White)),
    );

  public blackResult$: Observable<string> = this.gameState.board$
    .pipe(
      map(board => this.getResultText(board, Color.Black)),
    );

  private subs: Subscriptions = {};
  private _resizeBoardObserver: ResizeObserver;

  @HostBinding('class.board-flipped')
  get isPlayersSwitched() {
    return this.orientation !== this.defaultBottomPlayerColor;
  }

  constructor(
    public gameState: GameStateService,
    public boardState: BoardStateService,
    private cdr: ChangeDetectorRef,
    private stockfishService: PredictionsService,
  ) {
  }

  @ViewChild('chessBoard') board: ElementRef;
  @ViewChild(ChessBoardComponent) boardCmp: ChessBoardComponent;

  ngOnInit() {
  }

  ngAfterViewInit() {
    // this.syncBoardSize();
    this._resizeBoardObserver = new ResizeObserver(() => this.syncBoardSize());
    this._resizeBoardObserver.observe(this.board.nativeElement);
  }

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
    if (this._resizeBoardObserver) {
      this._resizeBoardObserver.unobserve(this.board.nativeElement);
      this._resizeBoardObserver.disconnect();
    }
  }

  private syncBoardSize() {
    const boardElement = this.board.nativeElement;
    this.boardPxSize = Math.min(boardElement.offsetWidth, boardElement.offsetHeight);
    this.cdr.detectChanges();
  }

  flipBoard() {
    this.orientation = this.orientation === Color.White ? Color.Black : Color.White;
  }

  changeDrawState(state: boolean) {
    this.boardCmp.drawMode = state;
    if (!state) this.boardCmp.clearShapes();
  }

  private calcCapturedPieces(moves: Move[]): CapturedPiecesType {
    // console.log(`run calc captured pieces`, moves.length);
    const chess = new Chess();
    const out = getStartCapturedPieces();
    for (let i = 0; i < moves.length; i++) {
      const move = chess.move(moves[i].san);
      if (!move) {
        chess.load(moves[i].fen);
        continue;
      }
      if (move.captured) {
        const color = move.color === 'w' ? Color.White : Color.Black;
        out[color][move.captured]++;
      }
    }

    return out;
  }

  private evaluatePositionScore(position: IMovePosition): Observable<number> {
    return this.stockfishService.getEvaluationMove(position.from_fen, position.san)
      .pipe(tap(score => position.stockfish_score = score));
  }

  private getResultText(board: Board, color: Color) {
    switch (board.result) {
      case BoardResult.VICTORY_WHITE:
        return color === Color.Black ? '0' : '1';
      case BoardResult.VICTORY_BLACK:
        return color === Color.Black ? '1' : '0';
      case BoardResult.STALEMATE:
      case BoardResult.DRAW:
        return '½';
      default:
        return '';
    }
  }
}
