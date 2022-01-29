import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy } from '@angular/core';
import { CapturedPiecesComponent } from './captured-pieces.component';
import { getMockMoves } from '../../../chess-core/services/test/mocks.spec';
import { take } from 'rxjs/operators';
import { Color } from '../../../chess-core/models/board.model';
import { By } from '@angular/platform-browser';
import { PieceComponent } from '../../../chess-core/components/piece/piece.component';
import { START_FEN } from '../../../chess-core/models/move.model';

describe('CapturedPiecesComponent', () => {
  let component: CapturedPiecesComponent;
  let fixture: ComponentFixture<CapturedPiecesComponent>;

  function getStartFen() {
    return START_FEN + '';
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CapturedPiecesComponent,
        PieceComponent,
      ],
      providers: [],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.overrideComponent(CapturedPiecesComponent, {
      set: {
        changeDetection: ChangeDetectionStrategy.Default,
      },
    }).createComponent(CapturedPiecesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
