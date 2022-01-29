import { IFederation, IPlayer } from './player.model';
import { SafeHtml } from '@angular/platform-browser';

export enum BoardStatus {
  EXPECTED = 1,
  GOES = 2,
  COMPLETED = 3
}

export enum BoardResult {
  VICTORY_WHITE = 'VICTORY_WHITE',
  VICTORY_BLACK = 'VICTORY_BLACK',
  DRAW = 'DRAW',
  STALEMATE = 'STALEMATE',
  NOTHING = '',
}

export type SideColor = 'white' | 'black';

export enum Color {
  White = 'white',
  Black = 'black',
}

export interface IBoardData {
  id: number;
  event?: string;
  datetime: string;
  white_player_name?: string;
  black_player_name?: string;
  white_player_federation: IFederation;
  black_player_federation: IFederation;
  white_player_elo: number;
  black_player_elo: number;
  status: BoardStatus; // used for result label
  result: BoardResult; // used for result label
  time_control?: ITimeControl;
  tournament_title: string;
  tournament_date_start: string;
  tournament_date_finish: string;
  tournament_place: string;
  tournament_info: string;
  file: string;
  video_source?: string;
  image?: string;
  board_only?: boolean;
}

export interface ITournament {
  title?: string;
  date_start?: Date;
  date_finish?: Date;
  place?: string;
  info?: string;
}

export interface IBoardBanner {
  video?: string | SafeHtml;
  image?: string;
}

export class Board {
  start_datetime: string;
  players: { [key in Color]: IPlayer };
  status: BoardStatus;
  result: BoardResult;
  time_control: ITimeControl;
  tournament: ITournament = {};
  link2pgnFile: string;
  banner: IBoardBanner = {};
  boardOnly = false;

  constructor(data: IBoardData = null) {
    if (!data) {
      return;
    }
    this.start_datetime = data.datetime;
    this.players = {
      [Color.White]: {
        full_name: data.white_player_name,
        federation: data.white_player_federation,
        rating: data.white_player_elo,
      },
      [Color.Black]: {
        full_name: data.black_player_name,
        federation: data.black_player_federation,
        rating: data.black_player_elo,
      },
    };
    this.status = data.status;
    this.result = data.result;
    this.time_control = data.time_control;
    this.tournament = {
      title: data.tournament_title,
      date_start: data.tournament_date_start ? new Date(data.tournament_date_start) : null,
      date_finish: data.tournament_date_finish ? new Date(data.tournament_date_finish) : null,
      info: data.tournament_info,
      place: data.tournament_place,
    };
    this.link2pgnFile = data.file;
    if (data.video_source) this.banner.video = data.video_source;
    if (data.image) this.banner.image = data.image;
    this.boardOnly = data.board_only;
  }

  getStartLeftTimeFor(color: Color): string {
    return color === Color.White
      ? this.time_control.white_time
      : this.time_control.black_time;
  }

  get resultText(): string | null {
    if (this.status !== BoardStatus.COMPLETED) return null;
    switch (this.result) {
      case BoardResult.VICTORY_BLACK:
        return 'BLACK VICTORY';
      case BoardResult.VICTORY_WHITE:
        return 'WHITE VICTORY';
      case BoardResult.DRAW:
        return 'DRAW';
      case BoardResult.STALEMATE:
        return 'STALEMATE';
      default:
        return 'GAME COMPLETED';
    }
  }
}

export interface ITimeControl {
  white_time: string; // Время на игру для белых
  black_time: string; // Время на игру для чёрных
  one_time_increment: string; // Разовый инкремент времени
  one_time_increment_move_number: number; // Номер хода, по наступлению которого добавляется разовый инкремент времени
  constant_increment: string; // Постоянный инкремент времени
  constant_increment_move_number: number; // Номер хода, по наступлению которого добавляется постоянный инкремент времени
}

export interface IBoardPosition {
  fen: string;
  stockfish_score: number;
}
