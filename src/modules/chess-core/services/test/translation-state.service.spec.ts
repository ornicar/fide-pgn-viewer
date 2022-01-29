import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChessApiService } from '../chess-api.service';
import { take } from 'rxjs/operators';
import { getMovesData } from './mocks.spec';
import { TranslationStateService } from '../translation-state.service';
import { SocketEvents, SocketService } from '../socket.service';
import { requestCounters, MockChessApiService, MockSocketService, resetCounters } from './mock-api-services.spec';


describe('TranslationStateService', () => {
  // let boardService: TranslationStateService;
  let service: TranslationStateService;
  let socket: MockSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        TranslationStateService,
        {
          provide: ChessApiService,
          useClass: MockChessApiService
        },
        {
          provide: SocketService,
          useClass: MockSocketService
        },
      ]
    });
    service = TestBed.get(TranslationStateService);
    socket = TestBed.inject<SocketService>(SocketService) as MockSocketService;
  });

  afterEach(() => {
    // console.log(`board counter on end`, countRequests.board);
    resetCounters();
  });

  it('should instance', () => {
    expect(service).toBeTruthy();
  });

  describe('Init board', () => {
    it('send request load board', () => {
      service.setBoardId(4);
      expect(requestCounters.board).toBe(1);
    });

    it('emit board', (done) => {
      service.board$
        .subscribe((b) => {
          expect(b).toBeTruthy();
          done();
        });
      service.setBoardId(4);
    }, 500);

    it('emit board after init', (done) => {
      service.setBoardId(4);
      service.board$
        .pipe(take(1))
        .subscribe((b) => {
          expect(b).toBeTruthy();
          done();
        });
    }, 500);

    it('send request load moves', () => {
      service.setBoardId(4);
      expect(requestCounters.moves).toBe(1);
    });

    it('set current position by last move', (done) => {
      service.setBoardId(4);
      service.currentPosition$
        .subscribe((p) => {
          expect(p.fen).toBe('rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3');
          done();
        });
    }, 500);

    it('set score by last move', (done) => {
      service.setBoardId(4);
      service.currentPosition$
        .subscribe((p) => {
          expect(p.stockfish_score).toBe(0.38);
          done();
        });
    }, 500);

    it('set turn is white', (done) => {
      service.setBoardId(4);
      service.isWhiteTurn$
        .subscribe((isWhite) => {
          expect(isWhite).toBeTruthy();
          done();
        });
    }, 500);

    it('set turn is black', (done) => {
      service.setBoardId(3);
      service.isWhiteTurn$
        .subscribe((isWhite) => {
          expect(isWhite).toBeFalsy();
          done();
        });
    }, 500);
  });

  describe('Socket', () => {
    it('subscribe on new moves', () => {
      service.setBoardId(0);
      expect(requestCounters.wsMoves).toBe(1);
    });

    it('emit move from socket', (done) => {
      const moves = getMovesData(4).slice(0, 1);
      service.currentPosition$
        .pipe(take(1))
        .subscribe(p => {
          expect(p.fen).toBe(moves[0].fen_move);
          done();
        });

      service.setBoardId(0);
      socket.emit({
        eventName: SocketEvents.MOVE,
        data: { moves }
      });
    }, 100);

    it('storage moves', (done) => {
      service.setBoardId(0);
      const moves = getMovesData(4).slice(0, 1);
      socket.emit({
        eventName: SocketEvents.MOVE,
        data: { moves }
      });

      service.history$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history.length).toBe(1);
          done();
        });
    }, 100);

    describe('replace moves', () => {
      it('update history', (done) => {
        service.setBoardId(2);
        const moves = getMovesData(4);
        // Set correct move number for replace
        moves[2].move_number = 1;
        moves[2].white_black_move = 0;
        moves[2].id = 1111111;
        moves[3].move_number = 1;
        moves[3].white_black_move = 1;
        moves[3].id = 2222222;
        socket.emit({
          eventName: SocketEvents.MOVE,
          data: {
            moves: [moves[3], moves[2]],
            deleted_moves_ids: [172723, 172724]
          }
        });

        service.history$
          .pipe(take(1))
          .subscribe((history) => {
            expect(history.length).toBe(2);
            expect(history[0].id).toBe(2222222);
            expect(history[1].id).toBe(1111111);
            done();
          });
      }, 100);

      it('update current position', (done) => {
        service.setBoardId(2);
        const moves = getMovesData(4);
        // Set correct move number for replace
        moves[2].move_number = 1;
        moves[2].white_black_move = 0;
        moves[2].id = 1111111;
        moves[3].move_number = 1;
        moves[3].white_black_move = 1;
        moves[3].id = 2222222;
        socket.emit({
          eventName: SocketEvents.MOVE,
          data: {
            moves: [moves[3], moves[2]],
            deleted_moves_ids: [172723, 172724]
          }
        });

        service.currentPosition$
          .pipe(take(1))
          .subscribe((position) => {
            expect(position.id).toBe(1111111);
            done();
          });
      }, 100);

      it('add new moves after replace exist', (done) => {
        service.setBoardId(2);
        const moves = getMovesData(5);
        moves[2].move_number = 1;
        moves[2].white_black_move = 0;
        moves[2].id = 1111111;
        moves[3].move_number = 1;
        moves[3].white_black_move = 1;
        moves[3].id = 2222222;
        moves[4].move_number = 2;
        moves[4].white_black_move = 1;
        socket.emit({
          eventName: SocketEvents.MOVE,
          data: {
            moves: [moves[3], moves[2], moves[4]],
            deleted_moves_ids: [172723, 172724]
          }
        });

        service.currentPosition$
          .pipe(
            take(1)
          )
          .subscribe((position) => {
            expect(position.id).toBe(172727);
            done();
          });
      }, 100);
    });

    describe('delete moves', () => {
      it('delete moves from end update current position', (done) => {
        service.setBoardId(3);
        socket.emit({
          eventName: SocketEvents.MOVE,
          data: {
            moves: [],
            deleted_moves_ids: [172724, 172725]
          }
        });

        service.currentPosition$
          .pipe(
            take(1)
          )
          .subscribe((position) => {
            expect(position.id).toBe(172723);
            done();
          });
      }, 100);

      it('delete intermediate moves, not update current position', (done) => {
        service.setBoardId(3);
        socket.emit({
          eventName: SocketEvents.MOVE,
          data: {
            moves: [],
            deleted_moves_ids: [172724]
          }
        });

        service.currentPosition$
          .pipe(
            take(1)
          )
          .subscribe((position) => {
            expect(position.id).toBe(172725);
            done();
          });
      }, 100);

      it('delete moves, update history', (done) => {
        service.setBoardId(3);
        socket.emit({
          eventName: SocketEvents.MOVE,
          data: {
            moves: [],
            deleted_moves_ids: [172724]
          }
        });

        service.history$
          .pipe(
            take(1)
          )
          .subscribe((moves) => {
            expect(moves.length).toBe(2);
            done();
          });
      }, 100);

      it('delete all moves, empty history', (done) => {
        service.setBoardId(1);
        socket.emit({
          eventName: SocketEvents.MOVE,
          data: {
            moves: [],
            deleted_moves_ids: [172723]
          }
        });

        service.history$
          .pipe(
            take(1)
          )
          .subscribe((moves) => {
            expect(moves.length).toBe(0);
            done();
          });
      }, 100);

      it('delete all moves, null position', (done) => {
        service.setBoardId(1);
        socket.emit({
          eventName: SocketEvents.MOVE,
          data: {
            moves: [],
            deleted_moves_ids: [172723]
          }
        });

        service.currentPosition$
          .pipe(
            take(1)
          )
          .subscribe((position) => {
            expect(position).toBeNull();
            done();
          });
      }, 100);
    });
  });
});
