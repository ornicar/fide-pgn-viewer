import { TFigure } from '../../board/components/chess-board/figure.model';
import * as moment from 'moment';
import { Color } from './board.model';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export interface IMovePositionData {
  move_number: number;
  white_black_move: boolean; // 1 - white, 0 - black
  fen: string;
  san: string;
}

export interface IMovePosition {
  fen: string;
  san: string | null;
  move_number: number;
  is_white_move: boolean;
  stockfish_score?: number; // used for score line
  from_fen?: string;
}

export interface IPredictionLine<T> {
  engine: number;
  lines: IPrediction<T>[];
  move_id: number;
  depth: number;
}

export interface IPrediction<T> {
  engine?: number;
  score: number;
  move_id?: number;
  depth?: number;
  nps?: number;
  // fen?: string;
  positions: T[];
}

export interface IMoveData {
  id: number;
  move_number: number;
  white_black_move: 1 | 0; // 1 - white, 0 - black
  fen_move: string;
  san_move: string;
  elapsed_move_time?: number; // Затраченное время на ход
  board_time_left?: number; // Оставшееся время на партию после совершения хода
  piece: TFigure;
  timestamp?: string;
  stockfish_score?: number;
}

export interface IMove extends IMovePosition {
  id: number;
  board?: number;
  // move_number: number;
  // is_white_move: boolean;
  // fen: string; // used for figures position on board
  figure: string; // used for history move
  // san: string; // used for history move
  created: string; // used for timers
  seconds_spent?: number; // used for metrics, history move
  seconds_left?: number; // used for move timer
  // stockfish_score?: number; // used for score line
  // prediction?: IMovePrediction[];
  user_move?: boolean;
}

export class Move implements IMove {
  id: number;
  move_number = 0;
  is_white_move: boolean;
  fen: string; // used for figures position on board
  figure: string; // used for history move
  san: string; // used for history move
  created: string; // used for timers
  seconds_spent = 0; // used for metrics, history move
  seconds_left = 0; // used for move timer
  stockfish_score = 0;
  user_move = false;
  from_fen: string;

  constructor(data: IMoveData = null) {
    if (data === null) {
      return;
    }
    this.id = data.id;
    this.move_number = data.move_number;
    this.fen = data.fen_move;
    this.is_white_move = data.white_black_move === 1;
    this.figure = data.piece;
    this.san = data.san_move;
    this.created = data.timestamp;
    this.seconds_spent = data.elapsed_move_time;
    this.seconds_left = data.board_time_left;
    this.stockfish_score = data.stockfish_score;
  }

  get color(): Color {
    return this.is_white_move ? Color.White : Color.Black;
  }
}

export const FigureSymbols = ['Q', 'P', 'B', 'R', 'K', 'N', 'O'];
