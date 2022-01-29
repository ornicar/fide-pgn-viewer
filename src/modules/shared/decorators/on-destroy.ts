import { Observable, Subject } from 'rxjs';

const destroySymbol = Symbol('NG_LIFECYCLE_DESTROY');

export function NgOnDestroy(): PropertyDecorator {
  return (target: any, propertyKey: string): void => {

    target.ngOnDestroy = function(): void {
      this[destroySymbol].next();
      this[destroySymbol].complete();
    };

    Object.defineProperty(target, propertyKey, {
      set: (): void => {},
      get(): Observable<any> {
        if (!this[destroySymbol] || this[destroySymbol].isStopped) {
          this[destroySymbol] = new Subject();
        }
        return this[destroySymbol];
      },
    });

  };
}
