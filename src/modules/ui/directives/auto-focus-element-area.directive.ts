import {
  AfterViewInit,
  Directive, ElementRef,
  Input, OnChanges, OnDestroy,
  OnInit, SimpleChanges
} from '@angular/core';
import { OnChangesInputObservable, OnChangesObservable } from '../../shared/decorators/observable-input';
import { BehaviorSubject } from 'rxjs';
import { AutoFocusElementService } from '../services/auto-focus-element.service';
import { SubscriptionHelper, Subscriptions } from '../../shared/helpers/subscription.helper';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[autoFocusElementArea]',
  providers: []
})
export class AutoFocusElementAreaDirective implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() autoFocusElementArea: any;
  @OnChangesInputObservable()
  autoFocusElementArea$ = new BehaviorSubject<any>(this.autoFocusElementArea);

  private elementMap = new WeakMap<any, ElementRef>();
  private _subs: Subscriptions = {};
  private _resizeAreaObserver: ResizeObserver;

  constructor(
    private autoFocusService: AutoFocusElementService,
    private elementRef: ElementRef,
  ) {
  }

  ngOnInit(): void {
    this._subs.focusElement = this.autoFocusElementArea$.asObservable()
      .pipe(debounceTime(50))
      .subscribe((elem) => this.focusToElement(elem));

    this._subs.addNewElement = this.autoFocusService.connectArea(this.elementRef.nativeElement)
      .subscribe((newElement) => {
        this.elementMap.set(newElement.refItem, newElement.elementRef);
        if (this.autoFocusElementArea$.value === newElement.refItem) {
          this.autoFocusElementArea$.next(newElement.refItem);
        }
      });
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this._subs);
    this.autoFocusService.disconnectArea(this.elementRef.nativeElement);
    if (this._resizeAreaObserver) {
      this._resizeAreaObserver.unobserve(this.elementRef.nativeElement);
      this._resizeAreaObserver.disconnect();
    }
  }

  ngAfterViewInit(): void {
    this._resizeAreaObserver = new ResizeObserver(() => {
      this.autoFocusElementArea$.next(this.autoFocusElementArea$.value);
    });
    this._resizeAreaObserver.observe(this.elementRef.nativeElement);
  }

  private focusToElement(item: any) {
    if (!Boolean(item)) return;
    const element = this.elementMap.get(item);
    if (!element) return;
    const scrollArea = this.elementRef.nativeElement;
    const elmRect = element.nativeElement.getBoundingClientRect();
    const wrapRect = scrollArea.getBoundingClientRect();

    const offsetBottom = elmRect.bottom - wrapRect.bottom;
    const offsetTop = wrapRect.top - elmRect.top;

    if (offsetBottom > 0) {
      scrollArea.scrollTop += offsetBottom;
    } else if (offsetTop > 0) {
      scrollArea.scrollTop -= offsetTop;
    }
  }
}
