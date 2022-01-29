export enum GameResult {
  WON = 'WON',
  LOST = 'LOST',
  DRAW = 'DRAW',
}

export enum EndReason {
  TIMEOUT = 'TIMEOUT',
  CLASSIC = 'CLASSIC',
  TIME_CONTROL = 'TIME_CONTROL',
  RESIGN = 'RESIGN',
  DRAW = 'DRAW',
  ABORT = 'ABORT',
  DISCONNECT = 'DISCONNECT',
  DRAW_OFFER = 'DRAW_OFFER',
  FOLD_REPETITION = 'FOLD_REPETITION', // Draw because of 5 repetitions
}
