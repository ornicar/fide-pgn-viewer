import { ElementRef, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface INewElementAutoScroll {
  refItem: any;
  elementRef: ElementRef;
}

@Injectable()
export class AutoFocusElementService {
  private areaMap = new WeakMap<any, Subject<INewElementAutoScroll>>();

  constructor() {
  }

  connectArea(areaElement: any): Observable<INewElementAutoScroll> {
    const subj = new Subject<INewElementAutoScroll>();
    this.areaMap.set(areaElement, subj);
    return subj.asObservable();
  }

  addNewElement(areaElement: any, item: any, elementRef: ElementRef) {
    if (!this.areaMap.has(areaElement)) {
      return;
    }
    this.areaMap.get(areaElement)
      .next({
        refItem: item,
        elementRef: elementRef,
      });
  }

  disconnectArea(nativeElement: any) {
    this.areaMap.delete(nativeElement);
  }
}
