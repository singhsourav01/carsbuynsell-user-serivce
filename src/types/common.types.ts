export interface male_requirement {
  mr_count: string;
  mr_min_height: string;
  mr_max_height: string;
  mr_min_age: string;
  mr_max_age: string;
}

export interface female_requirement {
  fr_count: string;
  fr_min_height: string;
  fr_max_height: string;
  fr_min_age: string;
  fr_max_age: string;
}

export interface other_requirement {
  or_count: string;
  or_min_height: string;
  or_max_height: string;
  or_min_age: string;
  or_max_age: string;
}

export interface location {
  lr_id: string;
  lr_requirement_id: string;
  lr_city_id: string;
  lr_min_latitude: number;
  lr_max_latitude: number;
  lr_min_longitude: number;
  lr_max_longitude: number;
  lr_created_at: Date;
  lr_updated_at: Date;
}

export type location_requirement = location[];
