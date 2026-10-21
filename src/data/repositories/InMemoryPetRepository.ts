import type { Pet } from '../../domain/entities/Pet';
import type { PetRepository } from '../../domain/repositories/PetRepository';

export class InMemoryPetRepository implements PetRepository {
  private pets: Pet[] = [
    { id: '1', name: 'Milo', species: 'dog', breed: 'Poodle', weightKg: 6 },
    { id: '2', name: 'Luna', species: 'cat', breed: 'British Shorthair', weightKg: 4 },
  ];

  async getAll(): Promise<Pet[]> {
    return this.pets;
  }
}