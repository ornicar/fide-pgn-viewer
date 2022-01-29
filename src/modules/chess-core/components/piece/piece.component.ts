import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

const iconClasses = {
  'Q': 'Q',
  'P': 'P',
  'B': 'B',
  'R': 'R',
  'K': 'K',
  'N': 'N',
  'O': '--' // For Castling.
};

@Component({
  selector: 'piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieceComponent implements OnInit {
  @Input() san: string;
  @Input() isWhite: boolean;
  @Input() piece: string;

  getIconClass() {
    if (this.piece) {
      const piece = this.piece.toUpperCase();
      const isWhite = this.isWhite !== undefined ? this.isWhite : piece === this.piece;
      return (isWhite ? 'w' : 'b') + iconClasses[piece];
    }
    console.log(` san :${this.san}`);
    return this.san
      ? (this.isWhite ? 'w' : 'b') + (iconClasses[this.san[0]] || iconClasses['P'])
      : '';
  }

  ngOnInit(): void {
  }
}
