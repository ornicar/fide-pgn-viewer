import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy } from '@angular/core';
import { PieceComponent } from './piece.component';
import { By } from '@angular/platform-browser';

describe('PieceComponent', () => {
  let component: PieceComponent;
  let fixture: ComponentFixture<PieceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PieceComponent,
      ],
      providers: [],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.overrideComponent(PieceComponent, {
      set: {
        changeDetection: ChangeDetectionStrategy.Default,
      },
    }).createComponent(PieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('san = Re6, isWhite = true, to be wB', () => {
    component.san = 'Re6';
    component.isWhite = true;
    fixture.detectChanges();
    const pieceClass = fixture.debugElement.query(By.css('.wR'));
    expect(pieceClass).toBeTruthy();
  });

  it('san = Be6, isWhite = false, to be bB', () => {
    component.san = 'Be6';
    component.isWhite = false;
    fixture.detectChanges();
    const pieceClass = fixture.debugElement.query(By.css('.bB'));
    expect(pieceClass).toBeTruthy();
  });

  it('san = e4, isWhite = false, to be bP', () => {
    component.san = 'e4';
    component.isWhite = false;
    fixture.detectChanges();
    const pieceClass = fixture.debugElement.query(By.css('.bP'));
    expect(pieceClass).toBeTruthy();
  });

  it('piece [B] to be wB', () => {
    component.piece = 'B';
    fixture.detectChanges();
    const pieceClass = fixture.debugElement.query(By.css('.wB'));
    expect(pieceClass).toBeTruthy();
  });

  it('piece [r] to be bR', () => {
    component.piece = 'r';
    fixture.detectChanges();
    const pieceClass = fixture.debugElement.query(By.css('.bR'));
    expect(pieceClass).toBeTruthy();
  });
});
