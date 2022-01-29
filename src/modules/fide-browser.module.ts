import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FideWidgetModule } from './fide-widget/fide-widget.module';
import { ChessBroadcastComponent } from './fide-widget/components/chess-broadcast/chess-broadcast.component';

@NgModule({
  imports: [
    FideWidgetModule,
    BrowserModule.withServerTransition({ appId: 'fide-arena' }),
    BrowserTransferStateModule,
  ],
  bootstrap: [
    ChessBroadcastComponent,
  ]
})
export class FideBrowserModule {

}
