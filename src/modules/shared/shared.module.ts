import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DurationPipe } from './pipes/duration.pipe';
import { SanWithoutPiecePipe } from './pipes/sanWithoutPiece.pipe';

const pipes = [
  DurationPipe,
  SanWithoutPiecePipe,
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ...pipes,
  ],
  exports: [
    ...pipes,
  ],
  providers: [
  ],
})
export class SharedModule {
}
