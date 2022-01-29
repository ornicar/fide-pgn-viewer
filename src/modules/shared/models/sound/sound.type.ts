import { IMove } from '../../../chess-core/models/move.model';

export type SoundStatuses = SoundStatus[];
export type SoundStatus = boolean | IMove;
