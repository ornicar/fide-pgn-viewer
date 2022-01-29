import { SoundType } from './sound.enum';
import { SoundStatuses } from './sound.type';
import { EndReason, GameResult } from '../game-result-enum';

export interface GameSoundResponseInterface {
  sound_type: string;
  file: string;
  file_encoded: string;
}

export interface SoundItemIterface {
  soundType: SoundType;
  audio: HTMLAudioElement;
}

export interface SoundTypesInterface {
  type: SoundStatuses;
  endReason: EndReason;
  gameResult: GameResult;
  isThreefoldRepetition: boolean;
}

