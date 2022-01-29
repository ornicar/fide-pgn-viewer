import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sanWithoutPiece'
})
export class SanWithoutPiecePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/^([K|Q|R|B|N])/, '');
  }
}
