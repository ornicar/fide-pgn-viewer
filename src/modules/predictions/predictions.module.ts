import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionsLineComponent } from './predictions-line/predictions-line.component';
import { PredictionsContainerComponent } from './predictions-container.component';
import { FlowContentComponent } from './flow-content.component';
import { ChessCoreModule } from '../chess-core/chess-core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UiModule } from '../ui/ui.module';
import { GroupByPipe } from './pipes/group-by.pipe';
import { ToIterablePipe } from './pipes/to-iterable.pipe';
import { PredictionsService } from './services/predictions.service';

@NgModule({
  imports: [
    CommonModule,
    ChessCoreModule,
    BrowserAnimationsModule,
    UiModule,
  ],
  declarations: [
    PredictionsLineComponent,
    PredictionsContainerComponent,
    FlowContentComponent,
    GroupByPipe,
    ToIterablePipe,
  ],
  providers: [
    PredictionsService,
  ],
  exports: [
    PredictionsContainerComponent,
  ]
})
export class PredictionsModule { }
