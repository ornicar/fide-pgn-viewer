import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostBinding,
  Input,
} from '@angular/core';
import { HideScrollbarService } from '../services/hide-scrollbar.service';

@Directive({
  selector: '[hideScrollbar]',
  providers: [
    HideScrollbarService,
  ]
})
export class HideScrollbarDirective implements AfterViewInit, AfterViewChecked {
  @Input()
  hideScrollbarType: 'vertical' | 'horizontal' | 'both' = 'vertical';

  // @Input('wcForceHideVerticalScrollBar')
  // wcForceHideVerticalScrollBar = false;

  private hideVerticalScrollbar = false;
  private hideHorizontalScrollbar = false;

  constructor(
    private elementRef: ElementRef,
    private cd: ChangeDetectorRef,
    private hideScrollbarService: HideScrollbarService
  ) {
  }

  ngAfterViewInit() {
    this.checkScroll();
  }

  ngAfterViewChecked() {
    this.checkScroll();
  }

  @HostBinding('style.margin-right.px')
  get verticalScrollbarWidth() {
    return this.hideVerticalScrollbar ? -this.hideScrollbarService.scrollbarWidth : 0;
  }

  @HostBinding('style.margin-bottom.px')
  get horizontalScrollbarWidth() {
    return this.hideHorizontalScrollbar ? -this.hideScrollbarService.scrollbarWidth : 0;
  }

  private checkScroll() {
    const target = this.hideScrollbarType;
    const elm = this.elementRef.nativeElement;

    if (target === 'vertical' || target === 'both') {
      this.hideVerticalScrollbar = elm.scrollHeight > elm.clientHeight;
    }

    if (target === 'horizontal' || target === 'both') {
      this.hideHorizontalScrollbar = elm.scrollWidth > elm.clientWidth;
    }
  }
}
