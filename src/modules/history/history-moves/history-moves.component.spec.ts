import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Injectable } from '@angular/core';
import { HistoryMovesComponent } from './history-moves.component';
import { BoardStateService } from '../../chess-core/services/board-state.service';
import { MoveComponent } from '../move/move.component';
import { MovePlaceholderComponent } from '../move-placeholder/move-placeholder.component';
import { GameStateService } from '../../chess-core/services/game-state.service';
import { TranslationStateService } from '../../chess-core/services/translation-state.service';
import { ChessApiService } from '../../chess-core/services/chess-api.service';
import { Board } from '../../chess-core/models/board.model';
import { getMockBoard, getMockMoves, getMockPosition } from '../../chess-core/services/test/mocks.spec';
import { Move, START_FEN } from '../../chess-core/models/move.model';
import { SocketService } from '../../chess-core/services/socket.service';
import { Observable, of, Subject } from 'rxjs';
import { take, tap, switchMap } from 'rxjs/operators';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '../../shared/shared.module';
import { ChessCoreModule } from '../../chess-core/chess-core.module';
import { UiModule } from '../../ui/ui.module';

describe('HistoryMovesComponent', () => {
  let component: HistoryMovesComponent;
  let gameService: GameStateService;
  let fixture: ComponentFixture<HistoryMovesComponent>;

  function getStartFen() {
    return START_FEN + '';
  }

  const socketMoves$ = new Subject<Move[]>();

  @Injectable()
  class MockChessApiService extends ChessApiService {
    getBoard(id): Observable<Board> {
      // console.log(`call mock get board`)
      // countRequests.board++;
      return of(getMockBoard(id));
    }

    getMoves(boardId): Observable<Move[]> {
      // console.log(`call mock get board`)
      // countRequests.moves++;
      return of(getMockMoves(boardId));
    }
  }

  @Injectable()
  class MockSocketService extends SocketService {
    public moves$ = socketMoves$.asObservable();

    constructor() {
      super();
    }

    connectToWidget(boardId: number) {
    }
  }

  // @Injectable()
  // class MockSocketService extends SocketService {
  //   public moves$ = socketMoves$.asObservable();
  //
  //   subscribe(boardId: number) {
  //     // countRequests.wsMoves++;
  //   }
  // }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SharedModule,
        ChessCoreModule,
        UiModule,
      ],
      declarations: [
        HistoryMovesComponent,
        MoveComponent,
        MovePlaceholderComponent,
      ],
      providers: [
        // GameStateService,
        // TranslationStateService,
        // BoardStateService,
        // SocketService,
        {
          provide: ChessApiService,
          useClass: MockChessApiService
        },
        {
          provide: SocketService,
          useClass: MockSocketService
        },
      ],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.overrideComponent(HistoryMovesComponent, {
      set: {
        changeDetection: ChangeDetectionStrategy.Default,
      },
    }).createComponent(HistoryMovesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    gameService = TestBed.inject<GameStateService>(GameStateService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('historyBlocks$', () => {
    it('create translation block', (done) => {
      component.historyBlocks$
        .pipe(take(1))
        .subscribe((blocks) => {
          expect(blocks.length).toBe(1, 'Should create 1 block');
          expect(blocks[0].moves).toBeTruthy();
          expect(blocks[0].moves.length).toBe(2);
          expect(blocks[0].moves[0]).toBeTruthy();
          expect(!!blocks[0].moves[1]).toBeFalsy();
          done();
        });

      gameService.setBoardId(1);
    }, 500);

    it('create My Moves block', (done) => {
      gameService.setBoardId(1);
      const pos = getMockPosition(3);
      component.historyBlocks$
        .pipe(
          take(1),
          switchMap(() => {
            gameService.createMove(pos);
            return component.historyBlocks$;
          }),
        )
        .subscribe((blocks) => {
          expect(blocks.length).toBe(2);
          done();
        });

    }, 500);

    it('clear My Moves block', (done) => {
      gameService.setBoardId(1);
      const pos = getMockPosition(3);
      component.historyBlocks$
        .pipe(
          take(1),
          switchMap(() => {
            gameService.createMove(pos);
            return component.historyBlocks$;
          }),
          switchMap(() => {
            component.clearMyMoves();
            return component.historyBlocks$;
          })
        )
        .subscribe((blocks) => {
          expect(blocks.length).toBe(1);
          done();
        });

    }, 500);

    it('recreate My Moves block', (done) => {
      gameService.setBoardId(0);
      const pos = getMockPosition(1);
      component.historyBlocks$
        .pipe(
          take(1),
          switchMap(() => {
            gameService.createMove(pos);
            return component.historyBlocks$.pipe(take(1));
          }),
          switchMap(() => {
            component.clearMyMoves();
            return component.historyBlocks$.pipe(take(1));
          }),
          switchMap(() => {
            gameService.createMove(pos);
            return component.historyBlocks$.pipe(take(1));
          }),
        )
        .subscribe((blocks) => {
          expect(blocks.length).toBe(1);
          done();
        });

    }, 500);

    it('remove my moves from start position', (done) => {
      gameService.setBoardId(1);
      const pos = getMockPosition(2);
      component.historyBlocks$
        .pipe(
          take(1),
          switchMap(() => {
            gameService.createMove(pos);
            return component.historyBlocks$.pipe(take(1));
          }),
          switchMap(() => {
            gameService.selectMoveFromHistory(null);
            return component.historyBlocks$.pipe(take(1));
          }),
          switchMap(() => {
            component.clearMyMoves();
            return component.historyBlocks$.pipe(take(1));
          }),
        )
        .subscribe((blocks) => {
          expect(blocks.length).toBe(1);
          done();
        });

    }, 500);
  });
});
