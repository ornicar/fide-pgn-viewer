import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'move-placeholder',
  template: '',
  styleUrls: ['./move-placeholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovePlaceholderComponent implements OnInit {
  constructor() { }

  ngOnInit() {}
}
