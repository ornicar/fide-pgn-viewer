import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Move } from '../../chess-core/models/move.model';

@Component({
  selector: 'move',
  templateUrl: './move.component.html',
  styleUrls: ['./move.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveComponent implements OnInit {
  @Input() move: Move;
  @Input() selected: Move;

  constructor() { }

  ngOnInit() {
  }
}
