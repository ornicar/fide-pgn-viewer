import { HammerGestureConfig } from '@angular/platform-browser';
import { Injectable, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import 'moment-duration-format';
import { FideWidgetComponent } from './components/widget/fide-widget.component';
import { ChessCoreModule } from '../chess-core/chess-core.module';
import { BoardModule } from '../board/board.module';
import { HistoryModule } from '../history/history.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { ChessBroadcastComponent } from './components/chess-broadcast/chess-broadcast.component';
import { NgxTabsModule } from '@ngx-tiny/tabs';
import { UiModule } from '../ui/ui.module';
import { BroadcastNavigationModule } from '../broadcast-navigation/broadcast-navigation.module';
import { TournamentInfoComponent } from './components/tournament-info/tournament-info.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Injectable()
export class CustomHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    'pinch': { enable: false },
    'rotate': { enable: false }
  };
}

@NgModule({
  declarations: [
    FideWidgetComponent,
    ChessBroadcastComponent,
    TournamentInfoComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    ChessCoreModule,
    BoardModule,
    HistoryModule,
    PredictionsModule,
    UiModule,
    BroadcastNavigationModule,
    RouterModule.forRoot([
      {
        path: 'widget/:widgetId',
        pathMatch: 'full',
        component: FideWidgetComponent,
      },
    ]),
    NgxTabsModule,
  ],
  providers: [],
})
export class FideWidgetModule {
}
