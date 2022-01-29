import { Board, BoardResult } from '../../models/board.model';
import { IMove, IMoveData, IMovePosition, IPrediction, Move } from '../../models/move.model';
import { TFigure } from '../../../board/components/chess-board/figure.model';

export function getMockBoard(id): Board {
  return new Board({
    id: id,
    event: 'event Name',
    datetime: '',
    white_player_name: 'Zurawski, Tadeusz',
    black_player_name: 'Shatilov, Artem',
    white_player_federation: null,
    black_player_federation: null,
    white_player_elo: 1094,
    black_player_elo: null,
    status: 2,
    result: BoardResult.NOTHING,
    tournament_title: 'Tournament title',
    tournament_date_start: null,
    tournament_date_finish: null,
    tournament_place: null,
    tournament_info: null,
    file: '',
  });
}

export function getMovesData(boardId: number): IMoveData[] {
  if (boardId === 0) return [];
  const moves = [
    {
      'id': 172723,
      'figure': 'P',
      'stockfish_score': 0.34,
      'fen': 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      'san': 'e4',
      'created': '2020-11-23T12:06:22Z',
      'move_number': 1,
      'is_white_move': true,
      'seconds_spent': 1194,
      'seconds_left': 6,
      'board': 2488
    },
    {
      'id': 172724,
      'figure': 'P',
      'stockfish_score': 0.51,
      'fen': 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      'san': 'e6',
      'created': '2020-11-23T12:06:27.393387Z',
      'move_number': 1,
      'is_white_move': false,
      'seconds_spent': 1199,
      'seconds_left': 1,
      'board': 2488
    },
    {
      'id': 172725,
      'figure': 'P',
      'stockfish_score': 0.32,
      'fen': 'rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2',
      'san': 'd4',
      'created': '2020-11-23T12:06:27.393481Z',
      'move_number': 2,
      'is_white_move': true,
      'seconds_spent': 4,
      'seconds_left': 2,
      'board': 2488
    },
    {
      'id': 172726,
      'figure': 'P',
      'stockfish_score': 0.38,
      'fen': 'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
      'san': 'd5',
      'created': '2020-11-23T12:06:32.426573Z',
      'move_number': 2,
      'is_white_move': false,
      'seconds_spent': 6,
      'seconds_left': 7,
      'board': 2488
    },
    {
      'id': 172727,
      'figure': 'N',
      'time_left': '00:00:09',
      'time_spent': '00:00:07',
      'stockfish_score': 0.13,
      'fen': 'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPPN1PPP/R1BQKBNR b KQkq - 1 3',
      'san': 'Nd2',
      'created': '2020-11-23T12:06:32.426669Z',
      'move_number': 3,
      'is_white_move': true,
      'pgn_special_symbol': null,
      'seconds_spent': 7,
      'total_spent': 1205,
      'seconds_left': 9,
      'reaction': null,
      'board': 2488
    },
    {
      'id': 172768,
      'figure': 'K',
      'time_left': '00:00:09',
      'time_spent': '00:00:01',
      'stockfish_score': 10.35,
      'fen': '2r2r2/p4ppk/1qb1p3/4Q3/3R4/P5P1/1P3P1P/4R1K1 w - - 0 24',
      'san': 'Kxh7',
      'created': '2020-11-23T12:08:12.450261Z',
      'move_number': 23,
      'is_white_move': false,
      'pgn_special_symbol': null,
      'seconds_spent': 1,
      'total_spent': 1261,
      'seconds_left': 9,
      'reaction': null,
      'board': 2488
    },
  ];
  return moves.slice(0, boardId)
    .map(m => {
      // m.board = boardId;
      return {
        fen_move: m.fen,
        stockfish_score: m.stockfish_score,
        id: m.id,
        move_number: m.move_number,
        white_black_move: m.is_white_move ? 1 : 0,
        san_move: m.san,
        elapsed_move_time: m.seconds_spent,
        board_time_left: m.seconds_left,
        piece: m.figure as TFigure,
        timestamp: m.created,
      };
    });
}

export function getMockMoves(boardId: number): Move[] {
  return getMovesData(boardId).map(m => new Move(m));
}

export function getMockPredictions(id: number): IPrediction<IMovePosition> {
  const out = [
    {
      'score': 0.07,
      'positions': [
        {
          'fen': 'rnbqkbnr/pp3ppp/4p3/2pp4/3PP3/5N2/PPPN1PPP/R1BQKB1R b KQkq - 1 4',
          'san': 'Ngf3',
          'move_number': 4,
          'is_white_move': true
        },
        {
          'fen': 'rnbqkbnr/pp3ppp/4p3/3p4/3pP3/5N2/PPPN1PPP/R1BQKB1R w KQkq - 0 5',
          'san': 'cxd4',
          'move_number': 4,
          'is_white_move': false
        },
        {
          'fen': 'rnbqkbnr/pp3ppp/4p3/3p4/3NP3/8/PPPN1PPP/R1BQKB1R b KQkq - 0 5',
          'san': 'Nxd4',
          'move_number': 5,
          'is_white_move': true
        },
        {
          'fen': 'r1bqkbnr/pp3ppp/2n1p3/3p4/3NP3/8/PPPN1PPP/R1BQKB1R w KQkq - 1 6',
          'san': 'Nc6',
          'move_number': 5,
          'is_white_move': false
        },
        {
          'fen': 'r1bqkbnr/pp3ppp/2N1p3/3p4/4P3/8/PPPN1PPP/R1BQKB1R b KQkq - 0 6',
          'san': 'Nxc6',
          'move_number': 6,
          'is_white_move': true
        },
        {
          'fen': 'r1bqkbnr/p4ppp/2p1p3/3p4/4P3/8/PPPN1PPP/R1BQKB1R w KQkq - 0 7',
          'san': 'bxc6',
          'move_number': 6,
          'is_white_move': false
        },
        {
          'fen': 'r1bqkbnr/p4ppp/2p1p3/3P4/8/8/PPPN1PPP/R1BQKB1R b KQkq - 0 7',
          'san': 'exd5',
          'move_number': 7,
          'is_white_move': true
        },
        {
          'fen': 'r1bqkbnr/p4ppp/2p5/3p4/8/8/PPPN1PPP/R1BQKB1R w KQkq - 0 8',
          'san': 'exd5',
          'move_number': 7,
          'is_white_move': false
        },
        {
          'fen': 'r1bqkbnr/p4ppp/2p5/3p4/8/1N6/PPP2PPP/R1BQKB1R b KQkq - 1 8',
          'san': 'Nb3',
          'move_number': 8,
          'is_white_move': true
        },
        {
          'fen': 'r1b1kbnr/p3qppp/2p5/3p4/8/1N6/PPP2PPP/R1BQKB1R w KQkq - 2 9',
          'san': 'Qe7+',
          'move_number': 8,
          'is_white_move': false
        },
        {
          'fen': 'r1b1kbnr/p3qppp/2p5/3p4/8/1N6/PPP1QPPP/R1B1KB1R b KQkq - 3 9',
          'san': 'Qe2',
          'move_number': 9,
          'is_white_move': true
        },
        {
          'fen': 'r3kbnr/p3qppp/2p5/3p4/6b1/1N6/PPP1QPPP/R1B1KB1R w KQkq - 4 10',
          'san': 'Bg4',
          'move_number': 9,
          'is_white_move': false
        },
        {
          'fen': 'r3kbnr/p3Qppp/2p5/3p4/6b1/1N6/PPP2PPP/R1B1KB1R b KQkq - 0 10',
          'san': 'Qxe7+',
          'move_number': 10,
          'is_white_move': true
        },
        {
          'fen': 'r3kb1r/p3nppp/2p5/3p4/6b1/1N6/PPP2PPP/R1B1KB1R w KQkq - 0 11',
          'san': 'Nxe7',
          'move_number': 10,
          'is_white_move': false
        },
        {
          'fen': 'r3kb1r/p3nppp/2p5/3p4/6b1/1N1B4/PPP2PPP/R1B1K2R b KQkq - 1 11',
          'san': 'Bd3',
          'move_number': 11,
          'is_white_move': true
        },
      ]
    },
    {
      'score': 0.0,
      'positions': [
        {
          'fen': 'rnbqkbnr/pp3ppp/4p3/1Bpp4/3PP3/8/PPPN1PPP/R1BQK1NR b KQkq - 1 4',
          'san': 'Bb5+',
          'move_number': 4,
          'is_white_move': true
        },
        {
          'fen': 'rn1qkbnr/pp1b1ppp/4p3/1Bpp4/3PP3/8/PPPN1PPP/R1BQK1NR w KQkq - 2 5',
          'san': 'Bd7',
          'move_number': 4,
          'is_white_move': false
        },
        {
          'fen': 'rn1qkbnr/pp1B1ppp/4p3/2pp4/3PP3/8/PPPN1PPP/R1BQK1NR b KQkq - 0 5',
          'san': 'Bxd7+',
          'move_number': 5,
          'is_white_move': true
        },
        {
          'fen': 'rn2kbnr/pp1q1ppp/4p3/2pp4/3PP3/8/PPPN1PPP/R1BQK1NR w KQkq - 0 6',
          'san': 'Qxd7',
          'move_number': 5,
          'is_white_move': false
        },
        {
          'fen': 'rn2kbnr/pp1q1ppp/4p3/2pp4/3PP3/5N2/PPPN1PPP/R1BQK2R b KQkq - 1 6',
          'san': 'Ngf3',
          'move_number': 6,
          'is_white_move': true
        },
        {
          'fen': 'rn2kbnr/pp1q1ppp/4p3/3p4/3pP3/5N2/PPPN1PPP/R1BQK2R w KQkq - 0 7',
          'san': 'cxd4',
          'move_number': 6,
          'is_white_move': false
        },
        {
          'fen': 'rn2kbnr/pp1q1ppp/4p3/3p4/3NP3/8/PPPN1PPP/R1BQK2R b KQkq - 0 7',
          'san': 'Nxd4',
          'move_number': 7,
          'is_white_move': true
        },
        {
          'fen': 'rn2kbnr/pp1q1ppp/8/3pp3/3NP3/8/PPPN1PPP/R1BQK2R w KQkq - 0 8',
          'san': 'e5',
          'move_number': 7,
          'is_white_move': false
        },
        {
          'fen': 'rn2kbnr/pp1q1ppp/8/3pp3/4P3/5N2/PPPN1PPP/R1BQK2R b KQkq - 1 8',
          'san': 'N4f3',
          'move_number': 8,
          'is_white_move': true
        },
        {
          'fen': 'r3kbnr/pp1q1ppp/2n5/3pp3/4P3/5N2/PPPN1PPP/R1BQK2R w KQkq - 2 9',
          'san': 'Nc6',
          'move_number': 8,
          'is_white_move': false
        },
        {
          'fen': 'r3kbnr/pp1q1ppp/2n5/3pp3/4P3/5N2/PPPN1PPP/R1BQ1RK1 b kq - 3 9',
          'san': 'O-O',
          'move_number': 9,
          'is_white_move': true
        },
        {
          'fen': '3rkbnr/pp1q1ppp/2n5/3pp3/4P3/5N2/PPPN1PPP/R1BQ1RK1 w k - 4 10',
          'san': 'Rd8',
          'move_number': 9,
          'is_white_move': false
        },
        {
          'fen': '3rkbnr/pp1q1ppp/2n5/3Pp3/8/5N2/PPPN1PPP/R1BQ1RK1 b k - 0 10',
          'san': 'exd5',
          'move_number': 10,
          'is_white_move': true
        },
        {
          'fen': '3rkbnr/pp3ppp/2n5/3qp3/8/5N2/PPPN1PPP/R1BQ1RK1 w k - 0 11',
          'san': 'Qxd5',
          'move_number': 10,
          'is_white_move': false
        },
        {
          'fen': '3rkbnr/pp3ppp/2n5/3qp3/8/5N2/PPPNQPPP/R1B2RK1 b k - 1 11',
          'san': 'Qe2',
          'move_number': 11,
          'is_white_move': true
        },
      ]
    },
    {
      'score': -0.04,
      'positions': [
        {
          'fen': 'rnbqkbnr/pp3ppp/4p3/2pp4/3PP3/8/PPPNNPPP/R1BQKB1R b KQkq - 1 4',
          'san': 'Ne2',
          'move_number': 4,
          'is_white_move': true
        },
      ]
    },
  ];

  return out[id];
}

export function getMockPosition(id): IMovePosition {
  return getMockPredictions(0).positions[id];
}
