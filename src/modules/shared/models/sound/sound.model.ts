import { EndReason, GameResult } from '../game-result-enum';
import { SoundType } from './sound.enum';
import { SoundStatus } from './sound.type';
import { SoundTypesInterface } from './sound.interface';

export class SoundTypeFactory {
  private endReasons = {
    draw: new Set<string>([
      EndReason.CLASSIC,
      EndReason.TIME_CONTROL,
      EndReason.RESIGN,
      EndReason.FOLD_REPETITION,
      EndReason.DRAW,
    ]),
    drawOffer: new Set<string>([
      EndReason.DRAW_OFFER,
    ]),
    zeitnot: new Set<string>([EndReason.TIME_CONTROL]),
    defeat: new Set<string>([EndReason.CLASSIC, EndReason.RESIGN]),
    win: new Set<string>([EndReason.CLASSIC, EndReason.RESIGN, EndReason.TIME_CONTROL]),
  };
  private gameResults = {
    draw: new Set([GameResult.DRAW]),
    drawOffer: new Set([GameResult.DRAW]),
    zeitnot: new Set([GameResult.LOST]),
    defeat: new Set([GameResult.LOST]),
    win: new Set([GameResult.WON]),
  };
  private readonly isResultShown: SoundStatus;
  private readonly playerOfferedDraw: SoundStatus;
  private readonly playerReadyToOfferDraw: SoundStatus;
  private readonly opponentOfferedDraw: SoundStatus;

  constructor(public soundType: SoundTypesInterface) {
    [
      this.isResultShown,
      ,
      this.playerOfferedDraw,
      this.playerReadyToOfferDraw,
      this.opponentOfferedDraw,
      ,
      ,
    ] = this.soundType.type;
  }

  get isDraw(): boolean {
    //  EndReason.DRAW && gameResult === GameResult.DRAW
    //  EndReason.CLASSIC && gameResult === GameResult.DRAW
    //  EndReason.TIME_CONTROL && gameResult === GameResult.DRAW
    //  EndReason.FOLD_REPETITION && gameResult === GameResult.DRAW

    return (
      this.endReasons.draw.has(this.soundType.endReason) &&
      this.gameResults.draw.has(this.soundType.gameResult)
    );
  }

  get isWin(): boolean {
    //  endReason === EndReason.RESIGN && gameResult === GameResult.WON
    //  endReason === EndReason.CLASSIC && gameResult === GameResult.WON
    return (
      this.endReasons.win.has(this.soundType.endReason) &&
      this.gameResults.win.has(this.soundType.gameResult)
    );
  }

  get isDrawOffer(): boolean {
    if (
      this.playerOfferedDraw ||
      this.playerReadyToOfferDraw ||
      this.opponentOfferedDraw ||
      (this.endReasons.drawOffer.has(this.soundType.endReason) &&
        this.gameResults.drawOffer.has(this.soundType.gameResult))
    ) {
      return true;
    }
  }

  get isDefeat(): boolean {
    // isResultShown && endReason === EndReason.CLASSIC && gameResult === GameResult.LOST
    // EndReason.CLASSIC && gameResult === GameResult.LOST
    // EndReason.RESIGN && gameResult === GameResult.LOST

    return (
      this.endReasons.defeat.has(this.soundType.endReason) &&
      this.gameResults.defeat.has(this.soundType.gameResult)
    );
  }

  get isZeitnot(): boolean {
    // EndReason.TIME_CONTROL && gameResult === GameResult.LOST

    return (
      this.endReasons.zeitnot.has(this.soundType.endReason) &&
      this.gameResults.zeitnot.has(this.soundType.gameResult)
    );
  }

  get activeSoundType(): SoundType {
    if (this.isDrawOffer) {
      return SoundType.DRAW_OFFER;
    }

    if (this.isResultShown) {
      if (this.isWin) {
        return SoundType.WIN;
      }
      if (this.isDefeat) {
        return SoundType.DEFEAT;
      }
      /*if (this.isZeitnot) {
        return SoundType.ZEITNOT;
      }*/
      if (this.isDraw) {
        return SoundType.DRAW;
      }
    }
  }
}
