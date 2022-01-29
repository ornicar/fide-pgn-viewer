import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BoardStateService } from '../board-state.service';
import { ChessApiService } from '../chess-api.service';
import { skip, switchMap, take, tap } from 'rxjs/operators';
import { getMockMoves, getMockPosition, getMockPredictions, getMovesData } from './mocks.spec';
import { GameStateService } from '../game-state.service';
import { TranslationStateService } from '../translation-state.service';
import { SocketEvents, SocketService } from '../socket.service';
import * as moment from 'moment';
import { MockChessApiService, MockSocketService, requestCounters, resetCounters } from './mock-api-services.spec';


describe('GameStateService', () => {
  let gameService: GameStateService;
  let boardService: BoardStateService;
  let socket: MockSocketService;
  const today = moment('2020-11-11T12:06:32Z');

  beforeAll(() => {
  });

  afterAll(() => {
    jasmine.clock().uninstall();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        BoardStateService,
        TranslationStateService,
        GameStateService,
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
    gameService = TestBed.get(GameStateService);
    resetCounters();
    boardService = TestBed.inject<BoardStateService>(BoardStateService);
    socket = TestBed.inject<SocketService>(SocketService) as MockSocketService;
    jasmine.clock().mockDate(today.toDate());
  });

  afterEach(() => {
    resetCounters();
  });

  describe('Init', () => {
    it('should instance', () => {
      expect(gameService).toBeTruthy();
    });

    it('load moves', () => {
      gameService.setBoardId(4);
      expect(requestCounters.moves).toBe(1);
    });

    it('load board', () => {
      gameService.setBoardId(4);
      expect(requestCounters.board).toBe(1);
    });
  });

  describe('Translation', () => {
    it('proxy loaded position to board', (done) => {
      gameService.setBoardId(3);
      boardService.currentPosition$
      // gameService.selectedMove$
        .pipe(take(1))
        .subscribe((p) => {
          expect(p.fen).toBe('rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2');
          done();
        });
    }, 500);

    it('proxy ws position to board', (done) => {
      gameService.setBoardId(3);
      const moves = getMovesData(4).slice(3, 4);
      socket.emit({ eventName: SocketEvents.MOVE, data: { moves } });
      boardService.currentPosition$
        .pipe(take(1))
        .subscribe((p) => {
          expect(p.fen).toBe('rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3');
          done();
        });
    }, 500);

    it('select last loaded move', (done) => {
      gameService.setBoardId(3);
      gameService.selectedMove$
        .pipe(take(1))
        .subscribe((p) => {
          expect(p.fen).toBe('rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2');
          done();
        });
    }, 500);

    it('select new move from WS', (done) => {
      gameService.setBoardId(3);
      const moves = getMovesData(4).slice(3, 4);
      socket.emit({ eventName: SocketEvents.MOVE, data: { moves } });
      gameService.selectedMove$
        .pipe(take(1))
        .subscribe((p) => {
          expect(p.fen).toBe('rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3');
          done();
        });
    }, 500);

    it('disable translation after select not last translation move', (done) => {
      gameService.setBoardId(3);
      const moves = getMockMoves(4);
      // socketMoves$.next(moves[3]);
      gameService.selectMoveFromHistory(moves[0]);
      gameService.isTranslation$
        .pipe(take(1))
        .subscribe((isTranslation) => {
          expect(isTranslation).toBeFalsy();
          done();
        });
    }, 500);

    it('enable translation after select last translation move', (done) => {
      gameService.setBoardId(2);
      const moves = getMockMoves(4);
      // socketMoves$.next(moves[3]);
      gameService.selectMoveFromHistory(moves[1]);
      gameService.isTranslation$
        .pipe(take(1))
        .subscribe((isTranslation) => {
          expect(isTranslation).toBeTruthy();
          done();
        });
    }, 500);

    it('return to translation', (done) => {
      gameService.setBoardId(2);
      const moves = getMockMoves(4);
      gameService.selectMoveFromHistory(moves[0]);
      gameService.enableTranslation();
      gameService.isTranslation$
        .pipe(take(1))
        .subscribe((isTranslation) => {
          expect(isTranslation).toBeTruthy();
          done();
        });
    }, 500);

    it('not change id for translation move', (done) => {
      gameService.setBoardId(1);
      const moves = getMockMoves(2);
      gameService.selectedMove$
        .pipe(take(1))
        .subscribe((move) => {
          expect(move.id).toBe(moves[0].id);
          done();
        });
    }, 500);

    it('disable translation after select prediction move', (done) => {
      gameService.setBoardId(1);
      const prediction = getMockPosition(0);
      gameService.selectMoveFromPrediction(prediction, [prediction]);
      gameService.isTranslation$
        .pipe(take(1))
        .subscribe((isTranslation) => {
          expect(isTranslation).toBeFalsy();
          done();
        });
    }, 500);

    it('replace selected move', (done) => {
      gameService.setBoardId(1);
      const newMove = getMovesData(1)[0];
      newMove.id = 123;
      const data = {
        deleted_moves_ids: [172723],
        moves: [newMove],
      };
      socket.emit({ eventName: SocketEvents.MOVE, data });
      // gameService.selectMoveFromPrediction([prediction]);
      gameService.selectedMove$
        .pipe(
          take(1),
        )
        .subscribe((move) => {
          expect(move.id).toBe(123);
          done();
        });
    }, 500);

    it('update selected move', (done) => {
      gameService.setBoardId(1);
      const newMove = getMovesData(1)[0];
      newMove.stockfish_score = 101;
      const data = {
        moves: [newMove],
      };
      socket.emit({ eventName: SocketEvents.MOVE_UPDATE, data });
      // gameService.selectMoveFromPrediction([prediction]);
      gameService.selectedMove$
        .pipe(
          take(1),
        )
        .subscribe((move) => {
          expect(move.stockfish_score).toBe(101);
          done();
        });
    }, 500);

    describe('delete moves', () => {
      it('delete selected move from end -> update selected move', (done) => {
        gameService.setBoardId(2);
        const data = {
          moves: [],
          deleted_moves_ids: [172724]
        };
        socket.emit({ eventName: SocketEvents.MOVE, data });
        // gameService.selectMoveFromPrediction([prediction]);
        gameService.selectedMove$
          .pipe(
            take(1),
          )
          .subscribe((move) => {
            expect(move.id).toBe(172723);
            done();
          });
      }, 500);

      it('delete move from middle, not update selected move', (done) => {
        gameService.setBoardId(3);
        const data = {
          moves: [],
          deleted_moves_ids: [172724]
        };
        socket.emit({ eventName: SocketEvents.MOVE, data });
        gameService.selectedMove$
          .pipe(
            take(1),
          )
          .subscribe((move) => {
            expect(move.id).toBe(172725);
            done();
          });
      }, 500);

      it('delete selected move from middle, update selected move', (done) => {
        gameService.setBoardId(3);
        // gameService.selectMoveFromHistory()
        gameService.historyToSelected$
          .pipe(
            take(1),
            switchMap((history) => {
              gameService.selectMoveFromHistory(history[1]);

              const data = {
                moves: [],
                deleted_moves_ids: [172724]
              };
              socket.emit({ eventName: SocketEvents.MOVE, data });

              return gameService.selectedMove$.pipe(take(1));
            }),
          )
          .subscribe((move) => {
            expect(move.id).toBe(172725);
            done();
          });
      }, 500);

      it('delete all moves, selected move as null', (done) => {
        gameService.setBoardId(2);

        const data = {
          moves: [],
          deleted_moves_ids: [172723, 172724]
        };
        socket.emit({ eventName: SocketEvents.MOVE, data });
        // gameService.selectMoveFromHistory()
        gameService.selectedMove$
          .pipe(
            take(1),
          )
          .subscribe((move) => {
            expect(move).toBeNull();
            done();
          });
      }, 500);
    });
  });

  describe('Select move', () => {
    it('proxy to board', (done) => {
      gameService.setBoardId(2);
      const moves = getMockMoves(4);
      gameService.selectMoveFromHistory(moves[0]);
      boardService.currentPosition$
        .pipe(take(1))
        .subscribe((position) => {
          expect(position.fen).toBeTruthy(moves[0].fen);
          done();
        });
    }, 500);

    it('proxy move from prediction', (done) => {
      gameService.setBoardId(2);
      const predictionMoves = getMockPredictions(1);
      const position = predictionMoves.positions[0];
      gameService.selectMoveFromPrediction(position, [position]);
      boardService.currentPosition$
        .pipe(take(1))
        .subscribe((pos) => {
          expect(pos.fen).toBe(position.fen);
          done();
        });
    }, 500);
  });

  describe('Add my move', () => {
    it('Switch to game after add move', (done) => {
      const position = getMockPosition(0);
      gameService.createMove(position);
      gameService.isMyGame$
        .pipe(take(1))
        .subscribe((isMyGame) => {
          expect(isMyGame).toBeTruthy();
          done();
        });
    }, 500);

    it('TakeOff translation after add move', (done) => {
      const position = getMockPosition(0);
      gameService.createMove(position);
      gameService.isTranslation$
        .pipe(take(1))
        .subscribe((isTranslation) => {
          expect(isTranslation).toBeFalsy();
          done();
        });
    }, 500);

    it('Selected my move', (done) => {
      gameService.setBoardId(3);
      const position = getMockPosition(0);
      gameService.createMove(position);
      gameService.selectedMove$
        .pipe(take(1))
        .subscribe((move) => {
          expect(move.fen).toBe(position.fen);
          done();
        });
    }, 500);

    it('not proxy translation move after start my game', (done) => {
      gameService.setBoardId(1);
      const position = getMockPosition(0);
      gameService.createMove(position);
      const moves = getMockMoves(4).slice(3, 4);
      socket.emit({ eventName: SocketEvents.MOVE, data: { moves } });
      gameService.selectedMove$
        .pipe(take(1))
        .subscribe((move) => {
          expect(move.fen).toBe(position.fen);
          done();
        });
    }, 500);

    it('set negative id for my turns', (done) => {
      gameService.setBoardId(1);
      const position = getMockPosition(0);
      gameService.createMove(position);
      gameService.selectedMove$
        .pipe(take(1))
        .subscribe((move) => {
          expect(move.id < 0).toBeTruthy();
          done();
        });
    }, 500);

    it('set unic id for my turns', (done) => {
      gameService.setBoardId(1);
      const position1 = getMockPosition(0);
      gameService.createMove(position1);
      const position2 = getMockPosition(1);
      gameService.createMove(position2);
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history[1].id).not.toBe(history[2].id);
          done();
        });
    }, 500);

    it('correct move number', (done) => {
      gameService.setBoardId(1);
      const position = getMockPosition(0);
      gameService.createMove(position);
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history[1].move_number).toBe(1);
          done();
        });
    }, 500);

    it('correct move color', (done) => {
      gameService.setBoardId(1);
      const position = getMockPosition(0);
      gameService.createMove(position);
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history[1].is_white_move).toBeFalsy();
          done();
        });
    }, 500);

    it('proxy my move to board', (done) => {
      gameService.setBoardId(1);
      const pos = getMockPosition(0);
      gameService.createMove(pos);
      boardService.currentPosition$
        .pipe(take(1))
        .subscribe((position) => {
          expect(position.fen).toBe(pos.fen);
          done();
        });
    }, 500);

    it('correct move number after add from prediction', (done) => {
      gameService.setBoardId(1);
      const prediction = getMockPredictions(0);
      const positions = prediction.positions.slice(0, 2);
      gameService.selectMoveFromPrediction(positions[1], positions);
      const pos = getMockPosition(3);
      gameService.createMove(pos);
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history.length).toBe(4);
          expect(history[0].move_number).toBe(1);
          expect(history[1].move_number).toBe(1);
          expect(history[2].move_number).toBe(2);
          expect(history[3].move_number).toBe(2);
          done();
        });
    }, 500);

    it('reselect start my game position', (done) => {
      gameService.setBoardId(3);
      const pos2 = getMockPosition(4);
      gameService.historyToSelected$
        .pipe(
          take(1),
          switchMap((history) => {
            gameService.selectMoveFromHistory(history[1]);
            const pos1 = getMockPosition(3);
            gameService.createMove(pos1);
            return gameService.historyToSelected$.pipe(take(1));
          }),
          switchMap((history) => {
            gameService.selectMoveFromHistory(history[0]);
            gameService.createMove(pos2);
            return gameService.historyToSelected$.pipe(take(1));
          }),
        )
        .subscribe((history) => {
          expect(history.length).toBe(2);
          expect(history[1].fen).toBe(pos2.fen);
          done();
        });
    }, 500);

    describe('Move from position', () => {
      it('calc spend time', (done) => {
        gameService.setBoardId(1);
        jasmine.clock().mockDate(moment('2020-11-23T12:06:26Z').toDate());
        const pos = getMockPosition(0);
        gameService.createMove(pos);
        gameService.historyToSelected$
          .pipe(take(1))
          .subscribe((history) => {
            expect(history[1].seconds_spent).toBe(4);
            done();
          });
      }, 500);

      it('set created = now', (done) => {
        gameService.setBoardId(1);
        const position = getMockPosition(0);
        gameService.createMove(position);
        gameService.historyToSelected$
          .pipe(take(1))
          .subscribe((history) => {
            expect(history[1].created).toBe(today.toISOString());
            done();
          });
      }, 500);
    });
  });

  describe('History', () => {
    it('set from translation', (done) => {
      const moves = getMockMoves(1);
      gameService.setBoardId(1);
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history.length).toBe(1);
          expect(history[0].fen).toBe(moves[0].fen);
          done();
        });
    }, 500);

    it('update from WS', (done) => {
      gameService.setBoardId(1);
      const moves = getMovesData(4);
      socket.emit({ eventName: SocketEvents.MOVE, data: { moves: moves.slice(1, 2) } });
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history.length).toBe(2);
          history
            .forEach((m, idx) => expect(m.fen).toBe(moves[idx].fen_move, `incorrect move with idx: ${idx}`));
          done();
        });
    }, 500);

    it('add user move', (done) => {
      gameService.setBoardId(0);
      // const moves = getMockMoves(4);
      const position = getMockPosition(0);
      gameService.createMove(position);
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history.length).toBe(1);
          expect(history[0].fen).toBe(position.fen);
          done();
        });
    }, 500);

    it('mark my move as "user_move"=true', (done) => {
      gameService.setBoardId(1);
      const position = getMockPosition(0);
      gameService.createMove(position);
      gameService.selectedMove$
        .pipe(take(1))
        .subscribe((move) => {
          expect(move.user_move).toBeTruthy();
          done();
        });
    }, 500);

    it('replace moves after selected move', (done) => {
      gameService.setBoardId(4);
      const moves = getMockMoves(4);
      const position = getMockPosition(0);
      gameService.historyToSelected$
        .pipe(
          take(1),
          switchMap((history) => {
            // expect(history.length).toBe(4);
            gameService.selectMoveFromHistory(moves[0]);
            gameService.createMove(position);
            return gameService.historyToSelected$.pipe(take(1));
          })
        )
        .subscribe((history) => {
          expect(history.length).toBe(2);
          expect(history[0].fen).toBe(moves[0].fen);
          expect(history[1].fen).toBe(position.fen);
          done();
        });
    }, 500);

    it('translation moves after return to translation', (done) => {
      gameService.setBoardId(2);
      const moves = getMockMoves(2);
      gameService.selectMoveFromHistory(moves[0]);
      const position = getMockPosition(0);
      gameService.createMove(position);
      gameService.enableTranslation();
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history.length).toBe(2);
          expect(history[0].fen).toBe(moves[0].fen);
          expect(history[1].user_move).toBeFalsy();
          done();
        });
    }, 500);

    it('start history myMoves branch', (done) => {
      gameService.setBoardId(2);
      const moves = getMockMoves(1);
      const position2 = getMockPosition(1);
      gameService.createMove(position2);
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history.length).toBe(3);
          expect(history[0].fen).toBe(moves[0].fen);
          expect(history[2].fen).toBe(position2.fen);
          done();
        });
    }, 500);

    it('replace tail myMoves branch after select middle my move and add new myMoves', (done) => {
      gameService.setBoardId(1);
      const moves = getMockMoves(5);
      gameService.selectMoveFromHistory(moves[0]);
      const position1 = getMockPosition(1);
      const position2 = getMockPosition(2);
      const position3 = getMockPosition(3);
      gameService.createMove(position1);
      gameService.createMove(position2);
      gameService.historyToSelected$
        .pipe(
          take(1),
          switchMap((history) => {
            gameService.selectMoveFromHistory(history[1]);
            gameService.createMove(position3);
            return gameService.historyToSelected$.pipe(take(1));
          })
        )
        .subscribe((history) => {
          expect(history.length).toBe(3);
          expect(history[0].fen).toBe(moves[0].fen);
          expect(history[1].fen).toBe(position1.fen);
          expect(history[2].fen).toBe(position3.fen);
          done();
        });
    }, 500);

    it('add selected predictions into history', (done) => {
      gameService.setBoardId(0);
      const predictionMove = getMockPredictions(1).positions[0];
      gameService.selectMoveFromPrediction(predictionMove, [predictionMove]);
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history.length).toBe(1);
          done();
        });
    }, 500);

    it('add multi selected predictions into history', (done) => {
      gameService.setBoardId(0);
      const predictionMoves = getMockPredictions(1).positions.slice(0, 2);
      gameService.selectMoveFromPrediction(predictionMoves[0], predictionMoves);
      gameService.myMoves$
        .pipe(take(1))
        .subscribe((moves) => {
          expect(moves.length).toBe(2);
          done();
        });
    }, 500);

    it('add moves from prediction as user moves', (done) => {
      gameService.setBoardId(0);
      const predictionMoves = getMockPredictions(1);
      const positions = predictionMoves.positions.slice(0, 1);
      gameService.selectMoveFromPrediction(positions[0], positions);
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history.length).toBe(1);
          expect(history[0].user_move).toBeTruthy();
          done();
        });
    }, 500);

    it('reset selected prediction after select move from history', (done) => {
      gameService.setBoardId(1);
      const predictionMoves = getMockPredictions(0);
      const positions = predictionMoves.positions.slice(0, 2);
      gameService.selectMoveFromPrediction(positions[0], positions);
      gameService.historyToSelected$
        .pipe(
          take(1),
          switchMap((history) => {
            gameService.selectMoveFromHistory(history[0]);
            gameService.createMove(predictionMoves.positions[3]);
            return gameService.historyToSelected$.pipe(take(1));
          })
        )
        .subscribe((history) => {
          expect(history.length).toBe(2);
          expect(history[1].fen).toBe(predictionMoves.positions[3].fen);
          done();
        });
    }, 500);

    it('add my move to end history', (done) => {
      gameService.setBoardId(2);
      const position = getMockPosition(3);
      gameService.createMove(position);
      gameService.historyToSelected$
        .pipe(take(1))
        .subscribe((history) => {
          expect(history.length).toBe(3);
          expect(history[2].fen).toBe(position.fen);
          done();
        });
    }, 500);
  });

  describe('myMoves$', () => {
    it('proxy new my move to myMoves$', (done) => {
      gameService.setBoardId(2);
      const pos = getMockPosition(3);
      gameService.createMove(pos);
      gameService.myMoves$
        .pipe(take(1))
        .subscribe((myMoves) => {
          expect(myMoves.length).toBe(1);
          expect(myMoves[0].fen).toBe(pos.fen);
          done();
        });
    }, 500);

    it('save Move id - start my game', (done) => {
      gameService.setBoardId(2);
      const pos = getMockPosition(3);
      gameService.createMove(pos);
      expect(gameService.idStartMyGame).toBe(172724);
      done();
    }, 500);
  });
});
