import type { Pet } from '../entities/Pet';

export interface PetRepository {
  getAll(): Promise<Pet[]>;
}