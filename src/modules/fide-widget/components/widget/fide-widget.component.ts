import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameStateService } from '../../../chess-core/services/game-state.service';
import {
  map,
  filter,
  distinctUntilChanged,
  take, tap,
} from 'rxjs/operators';
import {
  SubscriptionHelper,
  Subscriptions,
} from '../../../shared/helpers/subscription.helper';
import {
  Board,
  Color,
  IBoardBanner,
} from '@modules/chess-core/models/board.model';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { BrowserHelper } from '@modules/shared/helpers/browser.helper';
import { UrlConfigHelper } from '@modules/shared/helpers/url-config.helper';
import { Engine, PredictionsService } from '@modules/predictions/services/predictions.service';

@Component({
  selector: 'fide-widget',
  templateUrl: './fide-widget.component.html',
  styleUrls: ['./fide-widget.component.scss']
})
export class FideWidgetComponent implements AfterViewInit, OnDestroy {
  private subs: Subscriptions = {};

  public isOpenPrediction = true;
  public showLeela = false;
  public isShowLeela: Observable<boolean> = this.predictionsService.engines$.pipe(
      map(engines => engines.includes(Engine.CHESSIFY_LC_ZERO))
  );

  public banner$ = this.gameState.board$.pipe(
    map((board) => {
      const out: IBoardBanner = {};
      if (board.banner.video) {
        out.video = this.sanitizer.bypassSecurityTrustHtml(
          board.banner.video as string
        );
        return out;
      }
      if (board.banner.image) out.image = board.banner.image;
      return out;
    })
  );

  public onlyBoard$: Observable<boolean> = UrlConfigHelper.getVal<boolean>(this.activatedRoute, 'only_board', false);
  public hideHistoryTooltip$: Observable<boolean> = UrlConfigHelper.getVal<boolean>(this.activatedRoute, 'hide_hover', false);
  public hideCapturedPieces$: Observable<boolean> = UrlConfigHelper.getVal<boolean>(this.activatedRoute, 'hide_captured_pieces', false);

  constructor(
    private elementRef: ElementRef,
    private gameState: GameStateService,
    public predictionsService: PredictionsService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {
    this.subs.changeUrlWidgetId = this.activatedRoute.params
      .pipe(
        map(p => parseInt(p?.widgetId, 10)),
        filter((widgetId) => Boolean(widgetId)),
        distinctUntilChanged(),
      )
      .subscribe(widgetId => this.gameState.setBoardId(widgetId));
  }

  ngAfterViewInit() {
    BrowserHelper.lockOrientation('portrait');
  }

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  openPrediction(): void {
    this.isOpenPrediction = !this.isOpenPrediction;
  }

  downloadPGN() {
    this.gameState.board$.pipe(take(1)).subscribe((board: Board) => {
      const link = document.createElement('a');
      const pgnName = `${board.players[Color.White].full_name}_vs_${
        board.players[Color.Black].full_name
      }.pgn`;
      link.setAttribute('download', pgnName);
      link.href = board.link2pgnFile;
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }
}
