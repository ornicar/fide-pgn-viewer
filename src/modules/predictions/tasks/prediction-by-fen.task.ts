import { from } from 'rxjs';
import * as Chess from 'chess.js';
import { IMovePosition, IPrediction } from '../../chess-core/models/move.model';
import { StockfishTask } from './base.task';
import { delay } from 'rxjs/operators';

export class PredictionsByFenTask extends StockfishTask<{ [key: number]: IPrediction<IMovePosition> }> {
  private _chess;
  private _rows: { [key: string]: string } = {};

  constructor(private fen: string, private moveNumber: number, private targetDepth: number) {
    super();
  }

  private get chessWithStartPosition() {
    if (this._chess) {
      this._chess.load(this.fen);
    } else {
      this._chess = new Chess(this.fen);
    }
    return this._chess;
  }

  public get commands(): string[] {
    return [
      `ucinewgame`,
      `position fen ${this.fen}`,
      `go depth ${this.targetDepth}`];
  }

  public parseMsg(msg: string) {
    if (/^info depth/.test(msg))
      this.saveResult(msg);
    else if (/^bestmove/.test(msg))
      this.parseResult();
  }

  private saveResult(msg: string) {
    const [str, multipv] = /multipv (\d+)/.exec(msg);
    this._rows[multipv] = msg;
  }

  private parseResult() {
    this.result = {};
    from(Object.keys(this._rows))
      .pipe(delay(10)) // For not blocking main process
      .subscribe({
        next: rowKey => this.result[rowKey] = this.parseMoves(this._rows[rowKey]),
        complete: () => this.complete(),
      });
  }

  private parseMoves(msg): IPrediction<IMovePosition> {
    console.log(`[stockfish] parse moves`, msg);
    const [str, t, score] = /score (cp|mate) ([\-]?\d+)/.exec(msg);
    const chess = this.chessWithStartPosition;
    const moves = msg.match(/[a-h][1-8][a-h][1-8][q|r|b|n]?/g);
    const positions: IMovePosition[] = [];
    let moveNumber = this.moveNumber;
    for (let i = 0; i < moves.length; i++) {
      const move = chess.move(moves[i], { sloppy: true });
      positions.push({
        san: move.san,
        is_white_move: move.color === 'w',
        fen: chess.fen(),
        move_number: move.color === 'w' ? ++moveNumber : moveNumber
      });
    }
    if (!this.result) this.result = {};
    return {
      score: parseInt(score, 10) / 100,
      positions
    };
  }
}
