import { Color } from '../../chess-core/models/board.model';

export interface IPiecesDictionary {
  [key: string]: number;
}

export type CapturedPiecesType = { [key in Color]: IPiecesDictionary };

export function getStartCapturedPieces(): CapturedPiecesType {
  return {
    [Color.White]: getPiecesList(),
    [Color.Black]: getPiecesList(),
  };
}

export function getPiecesList(): IPiecesDictionary {
  return {
    'p': 0,
    'b': 0,
    'n': 0,
    'r': 0,
    'q': 0
  };
}
