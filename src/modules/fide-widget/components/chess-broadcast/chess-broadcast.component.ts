import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { DefaultUrlSerializer, Router, ActivatedRoute } from '@angular/router';
import { GameStateService } from '../../../chess-core/services/game-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './chess-broadcast.component.html',
  styleUrls: ['./chess-broadcast.component.scss']
})
export class ChessBroadcastComponent {

  constructor(
  ) {
  }
}
