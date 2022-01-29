import {
  Directive, ElementRef,
  Input,
  OnInit
} from '@angular/core';
import { AutoFocusElementService } from '../services/auto-focus-element.service';

@Directive({
  selector: '[autoFocusElementItem]',
  providers: []
})
export class AutoFocusElementItemDirective implements OnInit {
  @Input() autoFocusElementItem: any;
  @Input() autoFocusArea: any;

  constructor(
    private autoFocusService: AutoFocusElementService,
    private elementRef: ElementRef,
  ) {
  }

  ngOnInit(): void {
    if (!this.autoFocusElementItem) {
      return;
    }
    this.autoFocusService.addNewElement(this.autoFocusArea, this.autoFocusElementItem, this.elementRef);
  }
}
