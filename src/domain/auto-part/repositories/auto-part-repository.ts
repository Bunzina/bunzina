import type { AutoPart } from '../entities/auto-part';

export interface AutoPartRepository {
  create(autoPart: AutoPart): Promise<AutoPart>;
  findByName(name: string): Promise<AutoPart | null>;
  findById(id: string): Promise<AutoPart | null>;
}
