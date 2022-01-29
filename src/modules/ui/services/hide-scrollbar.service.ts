import { Inject, Injectable, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class HideScrollbarService {
  public scrollbarWidth: number;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.scrollbarWidth = this.getScrollbarWidth();
  }

  private getScrollbarWidth(): number {
    const ua = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
      return 6;
    }

    return this.calcScrollWidth();
  }

  private calcScrollWidth() {
    const outer = this.renderer.createElement('div');
    this.renderer.setStyle(outer, 'visibility', 'hidden');
    this.renderer.setStyle(outer, 'width', '100px');
    this.renderer.setStyle(outer, 'msOverflowStyle', 'scrollbar');  // needed for WinJS apps

    this.renderer.appendChild(this.document.body, outer);

    const widthNoScroll = outer.offsetWidth;
    // force scrollbars
    this.renderer.setStyle(outer, 'overflow', 'scroll');

    // add innerdiv
    const inner = this.renderer.createElement('div');
    this.renderer.setStyle(inner, 'width', '100%');
    this.renderer.appendChild(outer, inner);

    const widthWithScroll = inner.clientWidth;

    // remove divs
    this.renderer.removeChild(this.document.body, outer);

    return widthNoScroll - widthWithScroll;
  }
}
