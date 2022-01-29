import { Injectable } from '@angular/core';
import { BoardTooltipComponent } from '../components/baord-tooltip/board-tooltip.component';
import { BrowserHelper } from '@modules/shared/helpers/browser.helper';

export interface IBoardTooltipOptions {
  position: string;
  moveSan?: string;
  element: HTMLElement;
  leftTime?: string;
  stockfishScore?: number;
  isHeaderHidden?: boolean;
}

@Injectable()
export class BoardTooltipService {
  private _tooltip: BoardTooltipComponent;
  private _isMobileBrowser = false;

  constructor() {
    this._isMobileBrowser = BrowserHelper.isMobile;
  }

  connectTooltip(tooltip: BoardTooltipComponent) {
    this._tooltip = tooltip;
  }

  displayTooltip(options: IBoardTooltipOptions) {
    if (this._isMobileBrowser || !this._tooltip) return;
    this._tooltip.display(options);
  }

  hideTooltip() {
    if (!this._tooltip) return;
    this._tooltip.hide();
  }
}
