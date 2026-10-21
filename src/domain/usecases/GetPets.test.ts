import type { PetRepository } from '../repositories/PetRepository';
import { GetPets } from './GetPets';

test('GetPets trả về danh sách từ repository', async () => {
  const repo: PetRepository = {
    getAll: async () => [{ id: '1', name: 'A', species: 'dog', weightKg: 5 }],
  };

  const pets = await new GetPets(repo).execute();

  expect(pets).toHaveLength(1);
  expect(pets[0].name).toBe('A');
});