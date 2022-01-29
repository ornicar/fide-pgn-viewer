import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HideScrollbarDirective } from "./directives/hide-scrollbar.directive";
import { HideScrollbarService } from "./services/hide-scrollbar.service";
import { SvgClockComponent } from "./components/svg-clock/svg-clock.component";
import { SvgPlayComponent } from "./components/svg-play/svg-play.component";
import { SvgRewindComponent } from "./components/svg-rewind/svg-rewind.component";
import { SvgRotateComponent } from "./components/svg-rotate/svg-rotate.component";
import { OnInitDirective } from "./directives/on-init.directive";
import { AutoFocusElementItemDirective } from "./directives/auto-focus-element-item.directive";
import { AutoFocusElementAreaDirective } from "./directives/auto-focus-element-area.directive";
import { AutoFocusElementService } from "./services/auto-focus-element.service";
import { SvgGearComponent } from "./components/svg-gear/svg-geare.component";
import { SvgTimerComponent } from "./components/svg-timer/svg-timer.component";
import { SvgButtonsAddArrowComponent } from "./components/svg-buttons-add-arrow/svg-buttons-add-arrow.component";
import { SvgRewindBackComponent } from "@modules/ui/components/svg-rewind-back/svg-rewind-back.component";
import { SvgCloseComponent } from "./components/svg-close/svg-close.component";
import { SvgEyeComponent } from "./components/svg-eye/svg-eye.component";

@NgModule({
  imports: [CommonModule],
  declarations: [
    HideScrollbarDirective,
    // SvgArrowDownComponent,
    SvgClockComponent,
    SvgPlayComponent,
    SvgRewindComponent,
    SvgRewindBackComponent,
    SvgRotateComponent,
    SvgGearComponent,
    SvgTimerComponent,
    SvgButtonsAddArrowComponent,
    SvgCloseComponent,
    SvgEyeComponent,
    OnInitDirective,
    AutoFocusElementItemDirective,
    AutoFocusElementAreaDirective,
  ],
  exports: [
    HideScrollbarDirective,
    SvgClockComponent,
    SvgPlayComponent,
    SvgRewindComponent,
    SvgRewindBackComponent,
    SvgRotateComponent,
    SvgGearComponent,
    SvgTimerComponent,
    SvgButtonsAddArrowComponent,
    SvgCloseComponent,
    SvgEyeComponent,
    // SvgArrowDownComponent,
    OnInitDirective,
    AutoFocusElementItemDirective,
    AutoFocusElementAreaDirective,
  ],
  providers: [HideScrollbarService, AutoFocusElementService],
})
export class UiModule {}
