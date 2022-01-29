import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from './services/socket.service';
import { ChessApiService } from './services/chess-api.service';
import { GameStateService } from './services/game-state.service';
import { BoardStateService } from './services/board-state.service';
import { TranslationStateService } from './services/translation-state.service';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { PieceComponent } from './components/piece/piece.component';
import { PieceFromSanPipe } from './pipes/pieceFromSan';
import { BoardTooltipComponent } from './components/baord-tooltip/board-tooltip.component';
import { BoardTooltipService } from './services/board-tooltip.service';
import { UiModule } from '../ui/ui.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    UiModule,
  ],
  declarations: [
    PieceComponent,
    PieceFromSanPipe,
    BoardTooltipComponent,
  ],
  exports: [
    PieceComponent,
    PieceFromSanPipe,
    BoardTooltipComponent,
  ],
  providers: [
    ChessApiService,
    SocketService,
    GameStateService,
    BoardStateService,
    TranslationStateService,
    BoardTooltipService,
  ],
})
export class ChessCoreModule {
}
