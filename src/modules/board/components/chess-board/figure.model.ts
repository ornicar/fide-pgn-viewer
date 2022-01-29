export type TBlackPieces = 'b' | 'k' | 'n' | 'p' | 'q' | 'r';
export type TWhitePieces = 'B' | 'K' | 'N' | 'P' | 'Q' | 'R';
export type TFigure = TBlackPieces | TWhitePieces;

export const blackPiecesWeights: {[key in TBlackPieces]: number} = {
  'p': 1,
  'b': 3,
  'n': 3,
  'r': 5,
  'q': 9,
  'k': 1000,
};

export const whitePiecesWeights: {[key in TWhitePieces]: number} = {
  'P': 1,
  'B': 3,
  'N': 3,
  'R': 5,
  'Q': 9,
  'K': 1000,
};
