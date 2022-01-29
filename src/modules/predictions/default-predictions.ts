import { IMoveData, IMovePosition, IPrediction } from '../chess-core/models/move.model';

export const defaultPredictions: IPrediction<IMovePosition>[] = [
  {
    score: 0,
    positions: [
      {
        san: 'd4',
        fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
        is_white_move: true,
        move_number: 1
      },
      {
        san: 'd5',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2',
        is_white_move: false,
        move_number: 1
      },
      {
        san: 'Nf3',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq - 1 2',
        is_white_move: true,
        move_number: 2
      },
      {
        san: 'Nf6',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 2 3',
        is_white_move: false,
        move_number: 2
      },
      {
        san: 'e3',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R b KQkq - 0 3',
        is_white_move: true,
        move_number: 3
      },
      {
        san: 'e6',
        fen: 'rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 4',
        is_white_move: false,
        move_number: 3
      },
      {
        san: 'Be2',
        fen: 'rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/4PN2/PPP1BPPP/RNBQK2R b KQkq - 1 4',
        is_white_move: true,
        move_number: 4
      },
      {
        san: 'Be7',
        fen: 'rnbqk2r/ppp1bppp/4pn2/3p4/3P4/4PN2/PPP1BPPP/RNBQK2R w KQkq - 2 5',
        is_white_move: false,
        move_number: 4
      },
      {
        san: 'O-O',
        fen: 'rnbqk2r/ppp1bppp/4pn2/3p4/3P4/4PN2/PPP1BPPP/RNBQ1RK1 b kq - 3 5',
        is_white_move: true,
        move_number: 5
      },
      {
        san: 'Nbd7',
        fen: 'r1bqk2r/pppnbppp/4pn2/3p4/3P4/4PN2/PPP1BPPP/RNBQ1RK1 w kq - 4 6',
        is_white_move: false,
        move_number: 5
      },
      {
        san: 'Nbd2',
        fen: 'r1bqk2r/pppnbppp/4pn2/3p4/3P4/4PN2/PPPNBPPP/R1BQ1RK1 b kq - 5 6',
        is_white_move: true,
        move_number: 6
      },
      {
        san: 'O-O',
        fen: 'r1bq1rk1/pppnbppp/4pn2/3p4/3P4/4PN2/PPPNBPPP/R1BQ1RK1 w - - 6 7',
        is_white_move: false,
        move_number: 6
      },
      {
        san: 'c4',
        fen: 'r1bq1rk1/pppnbppp/4pn2/3p4/2PP4/4PN2/PP1NBPPP/R1BQ1RK1 b - - 0 7',
        is_white_move: true,
        move_number: 7
      },
    ]
  },
  {
    score: 0,
    positions: [
      {
        san: 'Nf3',
        fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1',
        is_white_move: true,
        move_number: 1
      },
      {
        san: 'd5',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2',
        is_white_move: false,
        move_number: 1
      },
      {
        san: 'd4',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq - 0 2',
        is_white_move: true,
        move_number: 2
      },
      {
        san: 'Nf6',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 1 3',
        is_white_move: false,
        move_number: 2
      },
      {
        san: 'e3',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R b KQkq - 0 3',
        is_white_move: true,
        move_number: 3
      },
      {
        san: 'e6',
        fen: 'rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 4',
        is_white_move: false,
        move_number: 3
      },
      {
        san: 'Nbd2',
        fen: 'rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/4PN2/PPPN1PPP/R1BQKB1R b KQkq - 1 4',
        is_white_move: true,
        move_number: 4
      },
      {
        san: 'Be7',
        fen: 'rnbqk2r/ppp1bppp/4pn2/3p4/3P4/4PN2/PPPN1PPP/R1BQKB1R w KQkq - 2 5',
        is_white_move: false,
        move_number: 4
      },
      {
        san: 'Bd3',
        fen: 'rnbqk2r/ppp1bppp/4pn2/3p4/3P4/3BPN2/PPPN1PPP/R1BQK2R b KQkq - 3 5',
        is_white_move: true,
        move_number: 5
      },
      {
        san: 'O-O',
        fen: 'rnbq1rk1/ppp1bppp/4pn2/3p4/3P4/3BPN2/PPPN1PPP/R1BQK2R w KQ - 4 6',
        is_white_move: false,
        move_number: 5
      },
      {
        san: 'O-O',
        fen: 'rnbq1rk1/ppp1bppp/4pn2/3p4/3P4/3BPN2/PPPN1PPP/R1BQ1RK1 b - - 5 6',
        is_white_move: true,
        move_number: 6
      },
      {
        san: 'Nbd7',
        fen: 'r1bq1rk1/pppnbppp/4pn2/3p4/3P4/3BPN2/PPPN1PPP/R1BQ1RK1 w - - 6 7',
        is_white_move: false,
        move_number: 6
      },
      {
        san: 'c4',
        fen: 'r1bq1rk1/pppnbppp/4pn2/3p4/2PP4/3BPN2/PP1N1PPP/R1BQ1RK1 b - - 0 7',
        is_white_move: true,
        move_number: 7
      },
    ]
  },
  {
    score: 0,
    positions: [
      {
        san: 'e4',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        is_white_move: true,
        move_number: 1
      },
      {
        san: 'd5',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        is_white_move: false,
        move_number: 1
      },
    ]
  },
];
