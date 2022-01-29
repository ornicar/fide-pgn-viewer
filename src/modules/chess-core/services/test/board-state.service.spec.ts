import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { BoardStateService } from '../board-state.service';
import { Observable, of, Subject } from 'rxjs';
import { ChessApiService } from '../chess-api.service';
import { Board } from '../../models/board.model';
import { filter, map, take } from 'rxjs/operators';
import { getMockBoard, getMockMoves } from './mocks.spec';
import { IMove, Move, START_FEN } from '../../models/move.model';
import { GameStateService } from '../game-state.service';
import { TranslationStateService } from '../translation-state.service';
import { ISocketMessage, SocketEvents, SocketService } from '../socket.service';
import { MockChessApiService, MockSocketService } from '@modules/chess-core/services/test/mock-api-services.spec';


describe('BoardStateService', () => {
  let boardService: BoardStateService;
  let gameService: GameStateService;
  let socket: MockSocketService;

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
    boardService = TestBed.get(BoardStateService);
    gameService = TestBed.inject<GameStateService>(GameStateService);
    socket = TestBed.inject<SocketService>(SocketService) as MockSocketService;
  });

  afterEach(() => {
    // console.log(`board counter on end`, countRequests.board);
    // countRequests = Object.assign({}, DEFAULT_COUNTERS);
  });

  it('should instance', () => {
    expect(boardService).toBeTruthy();
  });

  describe('Init board', () => {
    it('init start board position', (done) => {
      boardService.currentPosition$
        .subscribe((p) => {
          expect(p.stockfish_score).toBe(0);
          expect(p.fen).toBe(START_FEN);
          done();
        });
    }, 500);

    it('first turn is white', (done) => {
      boardService.isWhiteTurn$
        .subscribe((isWhite) => {
          expect(isWhite).toBeTruthy();
          done();
        });
    }, 500);
  });

  describe('delete moves', () => {
    it('delete all moves set start position', (done) => {
      gameService.setBoardId(2);

      const data = {
        moves: [],
        deleted_moves_ids: [172723, 172724]
      };
      socket.emit({ eventName: SocketEvents.MOVE, data });
      // gameService.selectMoveFromHistory()
      boardService.currentPosition$
        .pipe(
          take(1),
        )
        .subscribe((move) => {
          expect(move.fen).toBe(START_FEN);
          done();
        });
    }, 500);
  });
});
