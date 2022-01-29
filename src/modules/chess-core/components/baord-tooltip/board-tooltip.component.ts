import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { BoardTooltipService, IBoardTooltipOptions } from '../../services/board-tooltip.service';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import * as Chess from 'chess.js';
import { Config } from 'chessground/config';
import { DOCUMENT } from '@angular/common';

const TOOLTIP_SIZE = 264;
const TOOLTIP_HEADER = 32;

@Component({
  selector: 'board-tooltip',
  templateUrl: './board-tooltip.component.html',
  styleUrls: ['./board-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardTooltipComponent implements OnInit {
  public isShow = false;
  public isFocus = false;
  public _top = -9999;

  public _left = -9999;
  public stockfishScore: number = null;

  public leftTime: string = null;

  private isHeaderHidden = false;
  private chessground: Api;
  @ViewChild('board', { read: ElementRef, static: true }) boardElement: ElementRef<HTMLElement>;
  private chessEngine = new Chess();

  constructor(
    private boardTooltipService: BoardTooltipService,
    private cd: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  ngOnInit(): void {
    this.boardTooltipService.connectTooltip(this);
    this.chessground = Chessground(this.boardElement.nativeElement, this.chessgroungConf);
  }

  display(options: IBoardTooltipOptions) {
    // console.log(`[board-tooltip] fen: ${startPosition}, move: ${move}`);
    this.chessEngine.load(options.position);
    this.chessEngine.move(options.moveSan);
    this.isShow = true;
    this.isHeaderHidden = options.isHeaderHidden;
    this.stockfishScore = typeof options.stockfishScore === 'number' ? options.stockfishScore : null;
    this.leftTime = options.leftTime;

    const history = this.chessEngine.history({ verbose: true });

    // let lastMove = this.chessEngine.history({ verbose: true }).pop();
    const lastMove = history[0];
    // console.log(`[board-tooltip] history`, history, lastMove);
    // console.log(`[board-tooltip] svg path ${lastMove.from}-${lastMove.to}`);

    this.chessground.set({ fen: options.position });
    this.chessground.move(lastMove.from, lastMove.to);
    // this.chessground.setAutoShapes([{
    //   orig: lastMove.from,
    //   dest: lastMove.to,
    //   brush: 'green',
    // }]);

    const screen = [
      this.document.documentElement.clientWidth,
      this.document.documentElement.clientHeight,
    ];
    const elemRect = options.element.getBoundingClientRect();
    // console.log(`screen: `, screen, element, elemRect);
    const headerHeight = this.displayHeader ? TOOLTIP_HEADER : 0;
    const tooltipHeight = TOOLTIP_SIZE + headerHeight;

    if (elemRect.top > tooltipHeight) {
      this._top = elemRect.top - TOOLTIP_SIZE - 2;
      this._left = elemRect.left - TOOLTIP_SIZE + Math.round(elemRect.width / 2);
      this._left = Math.min(this._left, screen[0] - TOOLTIP_SIZE) - 2;
    } else if (elemRect.left > TOOLTIP_SIZE) {
      this._left = elemRect.left - TOOLTIP_SIZE;
      this._top = elemRect.top - tooltipHeight + Math.round(elemRect.height / 2);
      this._top = Math.max(this._top, headerHeight) + 2;
    }

    if (elemRect.left - TOOLTIP_SIZE < 0) {
      this._left = 2;
      this._top = elemRect.top - tooltipHeight - 2;
    }

    this.cd.detectChanges();
  }

  get top() {
    return this.isFocus || this.isShow ? this._top : -9999;
  }

  get left() {
    return this.isFocus || this.isShow ? this._left : -9999;
  }

  private createChessgroung() {
  }

  private get chessgroungConf(): Config {
    return {
      viewOnly: true,
      disableContextMenu: true,
      resizable: false,
      drawable: {
        enabled: false,
        visible: true,
        // defaultSnapToValidMove: true,
      },
      coordinates: false,
    };
  }

  hide() {
    this.isShow = false;
    this.cd.detectChanges();
  }

  onHover() {
    this.isFocus = true;
    this.cd.detectChanges();
  }

  onBlur() {
    this.isFocus = false;
    this.cd.detectChanges();
  }

  get displayHeader(): boolean {
    return !this.isHeaderHidden && (this.leftTime !== null || this.stockfishScore !== null);
  }
}
