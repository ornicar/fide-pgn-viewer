import { ElementRef } from '@angular/core';

let isPassiveSupported: boolean;

export class DomHelper {

  public static findParentByClass(element: any, className: string) {
    const parent = element.parentElement;
    if (!parent) {
      return parent;
    }
    const classArray = Object.keys(parent.classList).map(key => parent.classList[key]);
    if (classArray.some(i => i === className)) {
      return parent;
    } else {
      return this.findParentByClass(parent, className);
    }
  }

  public static isOutsideElement(element: ElementRef, targetElement: any) {
    const isOutside = !element.nativeElement.contains(targetElement);
    const isNotComponentElement = element.nativeElement !== targetElement;
    return isOutside && isNotComponentElement;
  }

  public static isPassiveSupported() {
    if (typeof isPassiveSupported === 'undefined') {
      isPassiveSupported = false;

      try {
        const options = Object.defineProperty({}, 'passive', {
          get: function() {
            isPassiveSupported = true;
          }
        });

        window.addEventListener('test', null, options);
      } catch (err) {
      }
    }

    return isPassiveSupported;
  }

  public static isOverlapped(el1: HTMLElement, el2: HTMLElement): boolean {
    const rects = {
      first: el1.getBoundingClientRect(),
      second: el2.getBoundingClientRect()
    };

    return !(
      rects.first.top > rects.second.bottom
      || rects.first.right < rects.second.left
      || rects.first.bottom < rects.second.top
      || rects.first.left > rects.second.right
    );
  }
}
