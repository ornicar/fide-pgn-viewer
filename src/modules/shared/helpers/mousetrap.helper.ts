import { NgZone } from '@angular/core';
import * as Mousetrap from 'mousetrap';

export class MousetrapEventTargetLike extends Mousetrap {

  bind: Function;
  unbind: Function;

  constructor(private ngZone: NgZone) {
    super();
  }

  private mousetrapCallbacks: Map<string, Set<Function>> = new Map();

  private getCallbacksSet(key: string) {
    if (!this.mousetrapCallbacks.has(key)) {
      this.mousetrapCallbacks.set(key, new Set<Function>());
    }

    return this.mousetrapCallbacks.get(key);
  }

  addListener(key, cb) {
    const callbacks = this.getCallbacksSet(key);

    callbacks.add(cb);

    if (callbacks.size === 1) {
      this.bind(key, event => {
        this.getCallbacksSet(key)
          .forEach(cbs => this.ngZone.run(() => cbs(event)));
      });
    }
  }

  removeListener(key, cb) {
    const callbacks = this.getCallbacksSet(key);

    callbacks.delete(cb);

    if (callbacks.size === 0) {
      this.unbind(key);
    }
  }
}

let eventTargetLike: any = null;

export class MousetrapHelper {

  // @todo use ngZone outside angular.
  static eventTargetLike(ngZone): any {
    if (!eventTargetLike) {
      eventTargetLike = new MousetrapEventTargetLike(ngZone);
    }

    return eventTargetLike;
  }
}
