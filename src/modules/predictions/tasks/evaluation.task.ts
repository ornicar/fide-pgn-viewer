import * as Chess from 'chess.js';
import { StockfishTask } from './base.task';

export class StockfishTaskGetEvaluationMove extends StockfishTask<number> {
  constructor(private fen: string, private moveSan: string) {
    super();
  }

  public get commands(): string[] {
    const chess = new Chess(this.fen);
    const move = chess.move(this.moveSan);

    console.log(`[stockfish] evaluation move: `, move);
    return [
      `position fen ${this.fen}`,
      `go searchmoves ${move.from}${move.to}${move.promotion || ''}`];
  }

  public parseMsg(msg: string) {
    if (/^info depth/.test(msg))
      this.parseScore(msg);
    // else if (/^bestmove/.test(msg))
    //   this.complete();
  }

  private parseScore(msg) {
    console.log(`[stockfish] msg-evaluation: `, msg);
    const [str, t, score] = /score (cp|mate) ([\-]?\d+)/.exec(msg);
    this.result = parseInt(score, 10) / 100;
    this.complete();
  }
}
