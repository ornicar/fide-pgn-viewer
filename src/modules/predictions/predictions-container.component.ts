import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { GameStateService } from '../chess-core/services/game-state.service';
import { IMovePosition, IPrediction, START_FEN } from '../chess-core/models/move.model';
import { debounceTime, map, startWith, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { Engine, PredictionsService } from './services/predictions.service';
import { START_BOARD_POSITION } from '@modules/chess-core/services/board-state.service';
import { OnChangesInputObservable, OnChangesObservable } from '@modules/shared/decorators/observable-input';

@Component({
  selector: 'predictions-container',
  templateUrl: './predictions-container.component.html',
  styleUrls: ['./predictions-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PredictionsContainerComponent implements OnInit, OnChanges {
  @Input()
  showLeela = false;
  @OnChangesInputObservable()
  showLeela$ = new BehaviorSubject<boolean>(this.showLeela);
  selectedMove: IMovePosition = null;
  displayEngines$ = combineLatest([this.predictions.engines$, this.showLeela$])
    .pipe(
      map(([engines, showLeela]) => {
        if (showLeela) return engines;
        return engines.filter(e => e !== Engine.CHESSIFY_LC_ZERO);
      }),
    );
  linesCount$: Observable<number> = combineLatest([
    this.displayEngines$,
    this.gameState.selectedMove$,
  ])
    .pipe(
      map(([engines, selectedMove]) => selectedMove?.user_move ? 3 : engines.length * 3)
    );
  boardPosition$ = this.gameState.selectedMove$
    .pipe(
      map(move => move ? move : START_BOARD_POSITION),
    );
  predictions$: Observable<IPrediction<IMovePosition>[]> = this.gameState.historyToSelected$
    .pipe(
      switchMap((moves) => {
        // if (!moves.length) return of([]);
        const lastMove = moves[moves.length - 1];
        let obs: Observable<IPrediction<IMovePosition>[]>;
        if (!lastMove) {
          obs = this.predictions.calcPredictionsByFen(START_FEN, 0);
        } else if (!lastMove.user_move) {
          obs = this.getPredictionsFormServer(this.gameState.widgetId, lastMove.id);
        } else {
          obs = this.predictions.calcPredictionsByMoves(moves);
        }
        return obs.pipe(startWith([]));
      }),
      debounceTime(10), // for wait update components, fix dropped frames
      tap(() => this.selectedMove = null),
    );

  constructor(
    private gameState: GameStateService,
    public predictions: PredictionsService,
  ) {}

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges(changes): void {
  }

  onPredictionChange(position: IMovePosition, prediction: IPrediction<IMovePosition>) {
    this.selectedMove = position;
    this.gameState.selectMoveFromPrediction(position, prediction.positions);
  }

  private getPredictionsFormServer(widgetId: number, moveId: number) {
    return combineLatest([
      this.predictions.getFilteredPredictions(this.gameState.widgetId, moveId),
      this.displayEngines$,
    ])
      .pipe(
        map(([predictions, displayEngines]) => {
          const filteredPredictions = predictions.filter(prediction => displayEngines.includes(prediction.engine));
          if (displayEngines.includes(Engine.CHESSIFY_LC_ZERO)) {
            return this.shuffleArray(predictions);
          }
          return filteredPredictions;
        }),
      );
  }

  private shuffleArray(predictions: IPrediction<IMovePosition>[]): IPrediction<IMovePosition>[] {
    const predictionsCopy = JSON.parse(JSON.stringify(predictions));
    const leelaPredictions = [];
    const chessifyPredictions = [];
    predictionsCopy.map(prediction => (
      prediction.engine === Engine.CHESSIFY_LC_ZERO ? leelaPredictions : chessifyPredictions).push(prediction)
    );
    const shuffledArray = [];
    for (let i = 0; i < Math.max(chessifyPredictions.length, leelaPredictions.length); i++) {
      if (chessifyPredictions[i]) shuffledArray.push(chessifyPredictions[i]);
      if (leelaPredictions[i]) shuffledArray.push(leelaPredictions[i]);
    }
    return shuffledArray;
  }
}
