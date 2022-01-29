import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pieceFromSan'
})
export class PieceFromSanPipe implements PipeTransform {

  static readonly figureKeys = [ 'Q', 'P', 'B', 'R', 'K', 'N' ];

  transform(notation: string, args?: any): any {
    if (!notation) {
      return '';
    }

    return PieceFromSanPipe.figureKeys.includes(notation[0]) ? notation[0] : notation;
  }

}
