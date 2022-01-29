import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as Chess from 'chess.js';
import { Chessground } from 'chessground';
import { Api as ChessgroundApi } from 'chessground/api';
import { Config as ChessgroundConfig } from 'chessground/config';
import * as ChessgroundType from 'chessground/types';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { delay, distinctUntilChanged, filter, take } from 'rxjs/operators';
import { TFigure } from './figure.model';
import { BoardStateService } from '../../../chess-core/services/board-state.service';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
import { IMovePosition, START_FEN } from '../../../chess-core/models/move.model';
import { GameStateService } from '../../../chess-core/services/game-state.service';
import { AudioService } from '../../services/audio.service';
import { Color } from '../../../chess-core/models/board.model';
import { DrawBrush, DrawShape } from 'chessground/draw';
import { Key } from 'chessground/types';
import { SoundType } from '@modules/shared/models';

export interface IChessEngineMove {
  color: 'w' | 'b';
  flags: string;
  from: ChessgroundType.Key;
  to: ChessgroundType.Key;
  promotion?: string;
  san: string;
  piece: string;
  captured?: TFigure;
}

const DEFAULT_CHESSGROUNG_CONF: ChessgroundConfig = {
  coordinates: false,
  resizable: true,
  draggable: {
    // centerPiece: false,
    showGhost: true
  },
  highlight: {
    lastMove: true,
    check: true
  },
  animation: {
    enabled: true,
    duration: 250
  },
  drawable: {
    enabled: true,
    visible: true,
  }
};

const STEP_OPACITY_BRUSH = .12;

@Component({
  selector: 'chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessBoardComponent implements OnInit, OnChanges, AfterViewInit, AfterContentChecked, OnDestroy {
  @Input()
  orientation: Color = Color.White;
  @OnChangesInputObservable('orientation') orientation$ = new BehaviorSubject<Color>(this.orientation);

  @ViewChild('board', { read: ElementRef, static: true }) boardElement: ElementRef<HTMLElement>;

  promotionMoves: IChessEngineMove[] = [];

  private chessEngine: Chess;
  private chessground: ChessgroundApi;
  private subs: Subscriptions = {};
  private _resizeBoardObserver: ResizeObserver;
  private _drawMode = false;
  private drawPositions: Key[][] = [];
  private maxBrushIdx = 0;

  constructor(
    private ngZone: NgZone,
    private element: ElementRef<HTMLElement>,
    private cd: ChangeDetectorRef,
    private boardState: BoardStateService,
    private gameState: GameStateService,
    private audioService: AudioService
  ) {}

  ngOnInit() {
    this.chessEngine = new Chess();

    this.subs.position = this.boardState.currentPosition$
      .pipe(
        distinctUntilChanged((prev, next) => prev?.fen === next?.fen),
      )
      .subscribe((move) => {
        if (move) this.updatePosition(move);
        else this.resetToStartPosition();
      });

    this.subs.orientation = this.orientation$
      .pipe(
        filter(() => !!this.chessground)
      )
      .subscribe(orientation => {
        this.chessground.set({ orientation: orientation });
      });

    this.initDrawMode();
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges) {
  }

  ngAfterViewInit() {
    this.initializeChessground();
    this.chessground.redrawAll();
    this._resizeBoardObserver = new ResizeObserver(() => this.chessground.redrawAll());
    this._resizeBoardObserver.observe(this.element.nativeElement);
  }

  ngAfterContentChecked() {
    // this.checkElementSize();
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);

    if (this.chessground) this.chessground.destroy();
    if (this._resizeBoardObserver) this._resizeBoardObserver.disconnect();
  }

  public clearShapes() {
    this.drawPositions = [];
    this.redrawShapes();
  }

  private getChessPossibleMoves(): { [key: string]: ChessgroundType.Key[] } {
    return this.chessEngine.SQUARES
      .reduce((accum, square) => {
        const moves = this.chessEngine.moves({ square: square, verbose: true });
        if (moves.length) accum[square] = moves.map(move => move.to);
        return accum;
      }, {});
  }

  private getChessLastMove(): ChessgroundType.Key[] {
    const lastMove = this.chessEngine.history({ verbose: true }).pop();
    return lastMove ? [lastMove.from, lastMove.to] : [];
  }

  private getChessTurnColor(): Color {
    return this.chessEngine.turn() === 'b' ? Color.Black : Color.White;
  }

  private initializeChessground(): void {
    const brushes = this.createBrushes();
    const viewConfig: ChessgroundConfig = {
      ...DEFAULT_CHESSGROUNG_CONF,
      check: this.chessEngine.in_check(),
      orientation: this.orientation,
      fen: this.chessEngine.fen(),
      turnColor: this.getChessTurnColor(),
      lastMove: this.getChessLastMove(),
      viewOnly: false,
      highlight: {
        lastMove: true
      },
      movable: this.movableConfig,
      events: {
        select: this.selectSquare.bind(this)
      },
      drawable: {
        ...DEFAULT_CHESSGROUNG_CONF.drawable,
        brushes,
      }
    };

    this.ngZone.runOutsideAngular(() => {
      this.chessground = Chessground(this.boardElement.nativeElement, viewConfig);
    });
  }

  private get movableConfig() {
    return {
      free: false,
      color: this.getChessTurnColor(),
      dests: this.getChessPossibleMoves(),
      events: {
        after: this.onPlayPiece.bind(this)
      }
    };
  }

  private createBrushes() {
    const out: DrawBrush[] = [];
    // console.log(`start create brushes`);
    for (let i = 1; i > 0; i -= STEP_OPACITY_BRUSH) {
      out.push({
        key: `green-${out.length}`,
        color: 'white',
        opacity: i,
        lineWidth: 10
      });
    }
    this.maxBrushIdx = out.length - 1;
    // console.log(`brushes`, out);
    return out;
  }

  private chessGroundUpdateMove() {
    this.ngZone.runOutsideAngular(() => {
      this.chessground.set({
        fen: this.chessEngine.fen(),
        turnColor: this.getChessTurnColor(),
        lastMove: this.getChessLastMove(),
        movable: {
          color: this.getChessTurnColor(),
          dests: this.getChessPossibleMoves()
        },
      });
    });
  }

  private onPlayPiece(from, to) {
    const validMoves = this.getValidMoves(from, to);
    if (!validMoves.length) return;
    const promotionMoves = validMoves.filter(m => Boolean(m.promotion));

    if (promotionMoves.length > 0) {
      this.displayPromotionModal(promotionMoves);
    } else {
      const newMove = this.chessEngine.move({ from, to });
      this.chessGroundUpdateMove();
      this.emitNewMove(newMove.san);
      this.playMoveSound();
    }
  }

  private getValidMoves(from: string, to: string): IChessEngineMove[] {
    return this.chessEngine
      .moves({ square: from, verbose: true })
      .filter(move => move.to === to);
  }

  private displayPromotionModal(moves: IChessEngineMove[]) {
    this.chessground.set({ movable: { color: null } });
    this.promotionMoves = ['n', 'b', 'r', 'q']
      .map(piece => moves.find(m => m.promotion === piece));
    this.cd.detectChanges();
  }

  private emitNewMove(san: string) {
    const newPos: IMovePosition = {
      fen: this.chessEngine.fen(), // Get new FEN notation.
      san,
      move_number: 0,
      is_white_move: this.getChessTurnColor() === Color.White
    };
    // console.log(`[chess-board]: new position ${newPos.fen}`);
    setTimeout(() => this.gameState.createMove(newPos), 0);
  }

  private promotionPiece(move: IChessEngineMove) {
    this.promotionMoves = [];
    this.chessEngine.move(move.san);
    this.chessGroundUpdateMove();
    this.emitNewMove(move.san);
    this.playMoveSound();
  }

  private playMoveSound() {
    const history = this.chessEngine.history({ verbose: true });
    const lastMove: IChessEngineMove = history ? history[history.length - 1] : {};
    console.log(`[chess-board] play sound move: `, lastMove);
    if (lastMove) {
      if (lastMove.san === 'O-O' || lastMove.san === 'O-O-O') {
        this.audioService.playKnock().pipe(delay(500)).subscribe();
      } else {
        if ('captured' in lastMove) {
          this.audioService.playSound(SoundType.CAPTURE).subscribe();
        } else {
          this.audioService.playKnock().subscribe();
        }
      }
    }
  }

  private updatePosition(position: IMovePosition) {
    if (this.chessEngine.fen() === position.fen) return;
    if (position.from_fen) {
      if (this.chessEngine.fen() !== position.from_fen) {
        this.chessEngine.load(position.from_fen);
      }
      if (position.from_fen === this.chessEngine.fen()) {
        this.chessEngine.move(position.san);
        this.playMoveSound();
      }
    } else {
      this.chessEngine.load(position.fen);
    }
    this.chessGroundUpdateMove();
  }

  private initDrawMode() {
    // Clear shapes by backspace
    this.subs.keyDown = fromEvent(document, 'keydown')
      .pipe(
        filter((e: KeyboardEvent) => e.key === 'Backspace')
      )
      .subscribe((e: KeyboardEvent) => this.clearShapes());
  }

  set drawMode(state: boolean) {
    this._drawMode = state;
    this.chessground.set({
      movable: !state ? this.movableConfig : { color: null },
    });
  }

  private selectSquare(key: Key) {
    if (!this._drawMode) return;
    const lastShape = this.drawPositions.length > 0 ? this.drawPositions[this.drawPositions.length - 1] : null;
    const shape = lastShape?.length === 1 ? lastShape : [];
    if (shape !== lastShape) {
      // if (!this.drawContinueMod) this.drawPositions = [];
      this.drawPositions.push(shape);
    }
    shape.push(key);
    this.redrawShapes();
  }

  private redrawShapes() {
    if (this.drawPositions.length > this.maxBrushIdx) {
      this.drawPositions = this.drawPositions.slice(this.drawPositions.length - this.maxBrushIdx, this.drawPositions.length);
    }
    const shapes: DrawShape[] = this.drawPositions.map((p, idx) => {
      const out: DrawShape = { orig: p[0], brush: `${this.drawPositions.length - idx}` };
      if (p[1]) out.dest = p[1];
      return out;
    });
    this.chessground.setAutoShapes(shapes);
  }

  private resetToStartPosition() {
    this.chessEngine.load(START_FEN);
    this.chessGroundUpdateMove();
  }
}
