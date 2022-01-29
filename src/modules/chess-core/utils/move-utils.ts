import { IMovePosition } from '../models/move.model';

export type SortMod = 1 | -1;
export type CompareResult = 0 | 1 | -1;

function isPrevMove(checkMove: IMovePosition, currentMove: IMovePosition): boolean {
  const diffMoveNumber = checkMove.move_number - currentMove.move_number;
  if (diffMoveNumber === 0) return checkMove.is_white_move && !currentMove.is_white_move;
  if (diffMoveNumber === -1) return currentMove.is_white_move && !checkMove.is_white_move;
  return false;
}

export function syncFromPosition(startPosition: string, moves: IMovePosition[]): void {
  moves.forEach((move, idx) => {
    if (idx === 0) {
      move.from_fen = startPosition;
    } else {
      const prevMove = moves[idx - 1];
      move.from_fen = isPrevMove(prevMove, move) ? prevMove.fen : null;
    }
  });
}

export function compareOrderMove(move1: IMovePosition, move2: IMovePosition): CompareResult {
  const moveNumberDiff = move1.move_number - move2.move_number;
  if (moveNumberDiff !== 0) return (moveNumberDiff > 0 ? 1 : -1);
  if (move1.is_white_move && !move2.is_white_move) return -1;
  if (!move1.is_white_move && move2.is_white_move) return 1;
  return 0;
}

export function sortMovies(moves: IMovePosition[], mod: SortMod = 1): IMovePosition[] {
  return moves
    .sort((move1, move2) => compareOrderMove(move1, move2) * mod);
}
