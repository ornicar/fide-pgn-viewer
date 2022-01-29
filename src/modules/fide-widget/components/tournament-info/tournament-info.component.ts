import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { DefaultUrlSerializer, Router, ActivatedRoute } from '@angular/router';
import { GameStateService } from '../../../chess-core/services/game-state.service';
import { TranslationStateService } from '../../../chess-core/services/translation-state.service';

@Component({
  selector: 'tournament-info',
  templateUrl: './tournament-info.component.html',
  styleUrls: ['./tournament-info.component.scss']
})
export class TournamentInfoComponent {
  board$ = this.translationState.board$;

  constructor(private translationState: TranslationStateService) {
  }
}
