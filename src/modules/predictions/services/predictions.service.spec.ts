import { TestBed } from '@angular/core/testing';

import { PredictionsService } from './predictions.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChessApiService } from '@modules/chess-core/services/chess-api.service';
import { MockChessApiService, MockSocketService, resetCounters } from '@modules/chess-core/services/test/mock-api-services.spec';
import { SocketEvents, SocketService } from '@modules/chess-core/services/socket.service';
import { of } from 'rxjs';
import { skip, take } from 'rxjs/operators';

describe('PredictionsService', () => {
  let predictionsService: PredictionsService;
  let socket: MockSocketService;
  let chessApi: ChessApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
          PredictionsService,
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
    predictionsService = TestBed.get(PredictionsService);
    resetCounters();
    socket = TestBed.inject<SocketService>(SocketService) as MockSocketService;
    chessApi = TestBed.inject(ChessApiService);
  });

  it('should be created', () => {
    expect(predictionsService).toBeTruthy();
  });

  it('should get engines for websocket', () => {
    socket.emit({ eventName: SocketEvents.CHANGE_PREDICTION_ENGINE, data: {engines: [1, 3]}});
    predictionsService.engines$.subscribe(engines => {
      expect(engines).toBe([1, 3]);
    });
  });

  describe('getting predictions', () => {
    it('should get predictions from websocket', (done) => {
      predictionsService.engines$ = of([1, 3]);
      const mockedPrediction = [
        {
          engine: 1,
          lines: [
            {score: 0.22, positions: []},
            {score: 0.42, positions: []},
            {score: 0.62, positions: []},
          ],
          move_id: 1
        },
      ];
      spyOn(predictionsService, 'getPredictionsFromWebSocket').and.returnValue(of(mockedPrediction));
      predictionsService.getPredictions(197, 1).subscribe(res => {
        expect(res).toEqual([
          { engine: 1, move_id: 1, score: 0.22, positions: [] },
          { engine: 1, move_id: 1, score: 0.42, positions: [] },
          { engine: 1, move_id: 1, score: 0.62, positions: [] },
        ]);
        done();
      });
    });

    it('should get predictions from api', (done) => {
      predictionsService.engines$ = of([1, 3]);
      const mockedPrediction = [
        {
          engine: 1,
          lines: [
            {score: 0.22, positions: []},
            {score: 0.42, positions: []},
            {score: 0.62, positions: []},
          ],
          move_id: 1
        },
      ];
      spyOn(chessApi, 'getPredictionsByFen').and.returnValue(of(mockedPrediction));
      predictionsService.getPredictions(197, 1).pipe(skip(1)).subscribe(res => {
        expect(res).toEqual([
          { engine: 1, move_id: 1, score: 0.22, positions: [] },
          { engine: 1, move_id: 1, score: 0.42, positions: [] },
          { engine: 1, move_id: 1, score: 0.62, positions: [] },
        ]);
        done();
      });
    });

    it('should filter predictions by engines', (done) => {
      predictionsService.engines$ = of([1, 3]);
      const mockedPrediction = [
        {
          engine: 1,
          lines: [
            {score: 0.22, positions: []},
            {score: 0.42, positions: []},
            {score: 0.62, positions: []},
          ],
          move_id: 1
        },
        {
          engine: 2,
          lines: [
            {score: 0.26, positions: []},
            {score: 0.46, positions: []},
            {score: 0.66, positions: []},
          ],
          move_id: 1
        },
      ];
      spyOn(predictionsService, 'getPredictionsFromWebSocket').and.returnValue(of(mockedPrediction));
      predictionsService.getPredictions(197, 1).subscribe(res => {
        expect(res).toEqual([
          { engine: 1, move_id: 1, score: 0.22, positions: [] },
          { engine: 1, move_id: 1, score: 0.42, positions: [] },
          { engine: 1, move_id: 1, score: 0.62, positions: [] },
        ]);
        done();
      });
    });
  });
});
