import { Observable, of, throwError, timer } from 'rxjs';
import { delay, filter, mergeMap, retryWhen } from 'rxjs/operators';

export const truthy = () => <T>(source: Observable<T>) =>
  source.pipe(filter((value) => !!value));

export const falsy = () => <T>(source: Observable<T>) =>
  source.pipe(filter((value) => !(!!value)));

export const retryStrategy = (maxRetryAttempts = 3, scalingDuration = 500) => (attempts: Observable<any>) => {
  let retries = maxRetryAttempts;
  return attempts.pipe(
    retryWhen((errors: Observable<any>) => {
      return errors.pipe(
        mergeMap((error, i) => {
          retries--;
          if (retries-- > 0) {
            const backoffTime = (maxRetryAttempts - retries) * scalingDuration;
            return of(error).pipe(delay(backoffTime));
          }
          return throwError(error);
          // const retryAttempt = i + 1;
          // // if maximum number of retries have been met
          // if (retryAttempt > maxRetryAttempts) return throwError(error);
          // console.log(`Attempt ${retryAttempt}: retrying in ${retryAttempt * scalingDuration}ms`);
          // if (scalingDuration === 0) return of(i);
          // // retry after 1s, 2s, etc...
          // return timer(retryAttempt * scalingDuration);
        }),
      );
    }),
  );
};
