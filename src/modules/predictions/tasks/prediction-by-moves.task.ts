import { from } from 'rxjs';
import * as Chess from 'chess.js';
import { IMovePosition, IPrediction } from '../../chess-core/models/move.model';
import { StockfishTask } from './base.task';
import { delay } from 'rxjs/operators';

export class PredictionsByMoveTask extends StockfishTask<{ [key: number]: IPrediction<IMovePosition> }> {
  private _chess;
  private _rows: { [key: string]: string } = {};
  private _lastMoveNumber = 0;
  private _start_fen: string;

  constructor(private moves: IMovePosition[], private targetDepth: number) {
    super();
    if (this.moves.length > 0) {
      this._lastMoveNumber = this.moves[this.moves.length - 1].move_number;
    }
  }

  public get commands(): string[] {
    this._chess = new Chess();
    this.moves.forEach(m => this._chess.move(m.san));
    this._start_fen = this._chess.fen();
    const moves = this._chess.history({ verbose: true })
      .reduce((curr, next) => {
        curr.push(`${next.from}${next.to}${next.promotion || ''}`);
        return curr;
      }, [])
      .join(' ');
    return [
      `ucinewgame`,
      `position startpos moves ${moves}`,
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
    // const chess = this.chessWithStartPosition;
    this._chess.load(this._start_fen);
    const moves = msg.match(/[a-h][1-8][a-h][1-8][q|r|b|n]?/g);
    const positions: IMovePosition[] = [];
    let moveNumber = this._lastMoveNumber;
    for (let i = 0; i < moves.length; i++) {
      const move = this._chess.move(moves[i], { sloppy: true });
      positions.push({
        san: move.san,
        is_white_move: move.color === 'w',
        fen: this._chess.fen(),
        move_number: move.color === 'w' ? ++moveNumber : moveNumber
      });
    }
    if (!this.result) this.result = {};
    const mult = (positions.length > 0 && !positions[0].is_white_move) ? -1 : 1;
    return {
      score: parseInt(score, 10) / 100 * mult,
      positions
    };
  }
}
