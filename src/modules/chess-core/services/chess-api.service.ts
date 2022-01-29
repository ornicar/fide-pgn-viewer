import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board, IBoardData } from '../models/board.model';
import { IMovePosition, Move, IMoveData, IPrediction, IMovePositionData, IPredictionLine } from '../models/move.model';
import { catchError, map, switchMap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { environment } from '@env';
import { retryStrategy } from '@modules/shared/helpers/rxjs-operators.helper';

@Injectable()
export class ChessApiService {
  static apiUrl = environment.apiServer;

  constructor(private http: HttpClient) {

  }

  getMoves(boardId): Observable<Move[]> {
    return this.http.get<IMoveData[]>(`${ChessApiService.apiUrl}/widget/${boardId}/moves/`)
      .pipe(
        map(data => data.map(m => new Move(m))),
      );
  }

  getBoard(id): Observable<Board> {
    return this.http.get<IBoardData[]>(`${ChessApiService.apiUrl}/widget/${id}/board/`)
      .pipe(
        switchMap((data) => {
          if (!data.length) {
            return throwError(`Widget [id:${id}] is not found`);
          }
          return of(new Board(data[0]));
        }),
      );
  }

  getPredictionsByFen(widgetId: number, id: number): Observable<IPredictionLine<IPrediction<IMovePosition>[]>[]> {
    return this.http.get<IPredictionLine<IPrediction<IMovePositionData>[]>[]>(`${ChessApiService.apiUrl}/widget/${widgetId}/predictions/${id}/`)
      .pipe(
        switchMap((result) => {
          if (!result.length) return throwError('Empty predictions');
          return of(result);
        }),
        retryStrategy(3, 500),
        catchError((err) => {
          console.error('[chess-api]: load predictions', err);
          return of([]);
        }),
      );
  }

  formatPositions(line: IPrediction<IMovePositionData>, engine: IPredictionLine<IPrediction<IMovePosition>[]>): IPrediction<IMovePosition> {
    return {
      engine: engine.engine,
      move_id: engine.move_id,
      depth: engine.depth,
      score: line.score,
      nps: line.nps,
      positions: line.positions.map(p => ({
        fen: p.fen,
        san: p.san,
        move_number: p.move_number,
        is_white_move: p.white_black_move,
      })),
    };
  }
}
