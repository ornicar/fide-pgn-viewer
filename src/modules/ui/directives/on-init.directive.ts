import {
  Directive,
  Input,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[onInit]',
  providers: [
  ]
})
export class OnInitDirective implements OnInit {
  @Input() onInit: () => void = () => {};

  constructor(
  ) {
  }

  ngOnInit(): void {
    this.onInit();
  }
}
