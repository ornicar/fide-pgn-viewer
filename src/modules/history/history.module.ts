import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessCoreModule } from '../chess-core/chess-core.module';
import { HistoryMovesComponent } from './history-moves/history-moves.component';
import { SharedModule } from '../shared/shared.module';
import { MoveComponent } from './move/move.component';
import { MovePlaceholderComponent } from './move-placeholder/move-placeholder.component';
import { UiModule } from '../ui/ui.module';

@NgModule({
  imports: [
    CommonModule,
    ChessCoreModule,
    SharedModule,
    UiModule,
  ],
  declarations: [
    HistoryMovesComponent,
    MoveComponent,
    MovePlaceholderComponent,
  ],
  exports: [
    HistoryMovesComponent,
  ],
  providers: [
  ]
})
export class HistoryModule { }
