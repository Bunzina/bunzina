import type { AutoPart } from '../entities/auto-part';

export interface FindAutoPartsFilters {
  name?: string;
}

export interface FindAutoPartsParams {
  page: number;
  limit: number;
  filters?: FindAutoPartsFilters;
}

export interface AutoPartRepository {
  create(autoPart: AutoPart): Promise<AutoPart>;
  findByName(name: string): Promise<AutoPart | null>;
  findById(id: string): Promise<AutoPart | null>;
  findByParams(params: FindAutoPartsParams): Promise<AutoPart[]>;
}
