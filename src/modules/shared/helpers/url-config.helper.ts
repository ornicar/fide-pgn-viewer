import { Observable, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map, shareReplay, startWith, tap } from 'rxjs/operators';

export class UrlConfigHelper {
  static getVal<T>(activatedRouter: ActivatedRoute, param: string = null, startVal: T): Observable<T> {
    if (param === null) return throwError(new Error('Undefined activated router param'));
    return activatedRouter.queryParams
      .pipe(
        map(params => params[param] as T),
        startWith(startVal),
        shareReplay(1),
      );
  }
}
