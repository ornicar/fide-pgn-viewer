import { ElementRef, HostBinding, Component, Input, OnChanges } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

const changeContent = trigger('changeContent', [
  transition('void <=> *', []),
  transition('* <=> *', [
    style({height: '{{destHeight}}px'}),
    animate('120ms ease-in'),
  ], {params: {destHeight: 0}})
]);

@Component({
  selector: 'wc-flow-content',
  template: `<ng-content></ng-content>`,
  styles: [`:host {
    display: flex;
    flex-flow: column;
    justify-content: flex-end;
    overflow: hidden;
  }`],
  animations: [changeContent]
})
export class FlowContentComponent implements OnChanges {
  @Input() trigger: string | number;
  destHeight: number;

  constructor(private element: ElementRef) {}

  @HostBinding('@changeContent')
  get changeContent() {
    return {value: this.trigger, params: {destHeight: this.destHeight}};
  }

  setStartHeight() {
    this.destHeight = this.element.nativeElement.clientHeight;
  }

  ngOnChanges() {
    this.setStartHeight();
  }
}
