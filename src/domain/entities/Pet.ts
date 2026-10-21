export type Species = 'dog' | 'cat';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed?: string;
  weightKg: number;
}