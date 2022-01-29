import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NouisliderModule } from 'ng2-nouislider';
import { BroadcastNavigationComponent } from './broadcast-navigation.component';
import { TimelineSliderComponent } from './broadcast-timeline/timeline-slider/timeline-slider.component';
import { BroadcastTimelineComponent } from './broadcast-timeline/broadcast-timeline.component';
import { ScoreTimelineChartComponent } from './broadcast-timeline/score-timeline-chart/score-timeline-chart.component';
import { FormsModule } from '@angular/forms';
import { ChessCoreModule } from '../chess-core/chess-core.module';
import { UiModule } from '../ui/ui.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NouisliderModule,
    ChessCoreModule,
    UiModule,
  ],
  declarations: [
    BroadcastNavigationComponent,
    TimelineSliderComponent,
    BroadcastTimelineComponent,
    ScoreTimelineChartComponent,
  ],
  providers: [
  ],
  exports: [
    BroadcastNavigationComponent,
    BroadcastTimelineComponent,
  ]
})
export class BroadcastNavigationModule {
}
