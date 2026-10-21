import { InMemoryPetRepository } from '../data/repositories/InMemoryPetRepository';
import { GetPets } from '../domain/usecases/GetPets';

const petRepository = new InMemoryPetRepository();

export const getPets = new GetPets(petRepository);