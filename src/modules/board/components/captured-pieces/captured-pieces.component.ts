import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Color } from '../../../chess-core/models/board.model';
import { blackPiecesWeights } from '../chess-board/figure.model';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CapturedPiecesType, getPiecesList, getStartCapturedPieces, IPiecesDictionary } from '../../models/captured-pieces.interface';

@Component({
  selector: 'captured-pieces',
  templateUrl: './captured-pieces.component.html',
  styleUrls: ['./captured-pieces.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CapturedPiecesComponent implements OnChanges {
  @Input()
  public capturedPieces = getStartCapturedPieces();
  @OnChangesInputObservable()
  public capturedPieces$ = new BehaviorSubject<CapturedPiecesType>(this.capturedPieces);

  @Input()
  public playerColor: Color;
  @OnChangesInputObservable()
  public playerColor$ = new BehaviorSubject<Color>(this.playerColor);

  playerCapturedPieces$: Observable<IPiecesDictionary> = combineLatest(
    this.capturedPieces$.asObservable(),
    this.playerColor$.asObservable(),
  )
    .pipe(
      filter(([pieces, color]) => Boolean(color)),
      map(([capturedPieces, color]) => {
        if (!capturedPieces) return getPiecesList();
        return capturedPieces[color];
      }),
    );

  listCapturedPieces$ = this.playerCapturedPieces$
    .pipe(
      map((pieces) => {
        return Object.keys(pieces)
          .filter(piece => pieces[piece] > 0)
          .map((piece) => [piece, pieces[piece]]);
      })
    );

  capturedScore$ = this.capturedPieces$.asObservable()
    .pipe(
      map((capturedPieces) => {
        if (!capturedPieces) return 0;
        return this.calcCaptureScore(capturedPieces, Color.White)
          - this.calcCaptureScore(capturedPieces, Color.Black);
      }),
    );

  playerCapturedScore$: Observable<string> = combineLatest(
    this.playerColor$.asObservable(),
    this.capturedScore$,
  )
    .pipe(
      filter(([color, score]) => Boolean(color)),
      map(([color, score]) => score * (color === Color.Black ? -1 : 1)),
      map(score => score < 1 ? '' : `+${score}`)
    );

  public Color = Color;

  public trackByGroup(index, item: string[]) {
    if (!item.length) return '0';
    return `${item[0]}-${item.length}`;
  }

  private calcCaptureScore(capturedPieces: CapturedPiecesType, color: Color): number {
    const pieces = capturedPieces[color];
    return Object.keys(pieces)
      .reduce((acum, piece) => acum + pieces[piece] * blackPiecesWeights[piece], 0);
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges): void {
  }
}
