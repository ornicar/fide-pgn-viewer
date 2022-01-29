import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardContainerComponent } from './board-container.component';
import { ChessCoreModule } from '../chess-core/chess-core.module';
import { SharedModule } from '../shared/shared.module';
import { ChessScoreLineComponent } from './components/chess-score-line/chess-score-line.component';
import { ChessBoardComponent } from './components/chess-board/chess-board.component';
import { MoveTimerComponent } from './components/move-timer/move-timer.component';
import { PlayerComponent } from './components/player/player.component';
import { PlayerResultComponent } from './components/player-result/player-result.component';
import { AudioService } from './services/audio.service';
import { PlayerFlagComponent } from './components/player-flag/player-flag.component';
import { TimerComponent } from './components/timer/timer.component';
import { CapturedPiecesComponent } from './components/captured-pieces/captured-pieces.component';
import { BroadcastNavigationModule } from '../broadcast-navigation/broadcast-navigation.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ChessCoreModule,
    BroadcastNavigationModule,
  ],
  declarations: [
    BoardContainerComponent,
    ChessScoreLineComponent,
    ChessBoardComponent,
    MoveTimerComponent,
    PlayerComponent,
    PlayerResultComponent,
    PlayerFlagComponent,
    TimerComponent,
    CapturedPiecesComponent,
  ],
  exports: [
    BoardContainerComponent,
    ChessScoreLineComponent,
    ChessBoardComponent,
  ],
  providers: [
    AudioService,
  ]
})
export class BoardModule { }
