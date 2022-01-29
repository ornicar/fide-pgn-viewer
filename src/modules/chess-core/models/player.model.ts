
export enum playerRank {
  GRANDMASTER = 'GM',
  WOMAN_GRANDMASTER = 'WGM',
  INTERNATIONAL_MASTER = 'IM',
  WOMAN_INTERNATIONAL_MASTER = 'WIM',
  FIDE_MASTER = 'FM',
  WOMAN_FIDE_MASTER = 'WFM'
}

export interface IFederation {
  name: string;
  code: string;
  flag_link: string;
  flag_pict: string;
}

export interface IPlayer {
  // fide_id: number;
  full_name: string; // used for player label
  // nickname?: string;
  // birth_year?: string;
  // rank?: playerRank; // used for player label
  rating: number; // used for player label
  // blitz_rating?: number;
  // rapid_rating?: number;
  federation?: IFederation; // used for player label
  // uid?: string;
  // id?: number;
  // is_male?: boolean;
  // nationality_id?: number;
}

