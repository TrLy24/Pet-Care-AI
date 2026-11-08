/**
 * PawCare AI — Pure Nutrition Calculator Service
 *
 * Clean Architecture: Domain Layer (Pure TypeScript, Zero Framework Dependencies).
 * Implements standard veterinary formulas:
 *   - RER (Resting Energy Requirement): RER = 70 * (bodyWeightKg ^ 0.75)
 *   - MER (Maintenance Energy Requirement): MER = RER * baseFactor * breedModifier
 *
 * Activity & Life-Stage Factors follow WSAVA (World Small Animal Veterinary Association)
 * and AAHA nutritional guidelines, integrated with specialized 37-breed knowledge base.
 */
import {
  type BreedNutritionProfile,
  findBreedNutritionProfile,
} from './breedNutritionProfiles';

export type PetLifeStage =
  | 'puppy_kitten_young' // < 4 months
  | 'puppy_kitten_older' // 4 to 12 months
  | 'adult'
  | 'senior';

export type NutritionActivityLevel = 'low' | 'moderate' | 'high' | 'working';

export interface NutritionCalculationInput {
  species: 'dog' | 'cat' | 'bird' | 'hamster' | 'rabbit';
  weightKg: number;
  lifeStage: PetLifeStage;
  isNeutered: boolean;
  activityLevel: NutritionActivityLevel;
  isObeseProne?: boolean;
  isWeightLoss?: boolean;
  /** Optional breed identifier or key (e.g. 'beagle', 'persian') */
  breedKey?: string | null;
  /** Optional breed display name (e.g. 'Poodle Toy', 'Mèo Anh lông ngắn') */
  breedName?: string | null;
}

export interface NutritionCalculationResult {
  weightKg: number;
  rerKcal: number;
  activityFactor: number;
  merKcal: number;
  recommendedMealsPerDay: number;
  recommendedWaterMlPerDay: number;
  summaryVi: string;
  formulaExplanationVi: string;
  /** Matched breed profile with clinical guidelines */
  breedProfile: BreedNutritionProfile | null;
  /** Breed-specific metabolic adjustment factor (1.0 = standard) */
  breedModifier: number;
  /** Recommended daily dry food (kibble ~370 kcal/100g) in grams */
  dryFoodGrams: number;
  /** Recommended daily wet food (pate ~100 kcal/100g) in grams */
  wetFoodGrams: number;
  /** Optimal mixed diet customized for this breed */
  optimalDiet: {
    dryGrams: number;
    wetGrams: number;
    wetPercentage: number;
  };
  /** Target macronutrient distribution (% of daily calories) */
  macroRatio: {
    proteinPercent: number;
    fatPercent: number;
    carbsPercent: number;
  };
}

/**
 * Standard Veterinary MER Multipliers
 * Documented configurable constants.
 */
export const NUTRITION_FACTORS = {
  dog: {
    puppyYoung: 3.0, // < 4 months
    puppyOlder: 2.0, // 4-12 months
    adultNeutered: 1.6,
    adultIntact: 1.8,
    senior: 1.4,
    inactiveObeseProne: 1.2,
    weightLoss: 1.0,
    activeModerate: 1.8,
    activeHigh: 2.2,
    working: 3.0,
  },
  cat: {
    kittenYoung: 2.5,
    kittenOlder: 2.0,
    adultNeutered: 1.2,
    adultIntact: 1.4,
    senior: 1.1,
    inactiveObeseProne: 1.0,
    weightLoss: 0.8,
    activeHigh: 1.6,
  },
  bird: {
    young: 2.0,
    adult: 1.5,
    senior: 1.2,
    activeHigh: 1.8,
  },
  hamster: {
    young: 1.8,
    adult: 1.4,
    senior: 1.1,
    activeHigh: 1.6,
  },
  rabbit: {
    young: 2.0,
    adultNeutered: 1.3,
    adultIntact: 1.5,
    senior: 1.1,
    inactiveObeseProne: 1.0,
    weightLoss: 0.9,
    activeHigh: 1.6,
  },
} as const;

/**
 * Calculate Resting Energy Requirement (RER)
 * - Mammals (Chó, Mèo, Thỏ, Hamster): Kleiber law RER = 70 * (weightKg ^ 0.75)
 * - Birds (Passerine & Psittacine): Avian standard BMR = 78 * (weightKg ^ 0.75) (or 10-15% higher than eutherian mammals)
 */
export function calculateRER(weightKg: number, species: 'dog' | 'cat' | 'bird' | 'hamster' | 'rabbit' = 'dog'): number {
  if (weightKg <= 0) {
    throw new Error('Cân nặng phải lớn hơn 0 kg');
  }
  const factor = species === 'bird' ? 78 : 70;
  const rer = factor * Math.pow(weightKg, 0.75);
  return Math.round(rer * 10) / 10;
}

/**
 * Determine the base MER factor based on species, life stage, neuter status, and activity.
 */
export function determineActivityFactor(input: NutritionCalculationInput): number {
  const { species, lifeStage, isNeutered, activityLevel, isObeseProne, isWeightLoss } = input;

  if (species === 'dog') {
    if (isWeightLoss) return NUTRITION_FACTORS.dog.weightLoss;
    if (isObeseProne || activityLevel === 'low') return NUTRITION_FACTORS.dog.inactiveObeseProne;
    if (lifeStage === 'puppy_kitten_young') return NUTRITION_FACTORS.dog.puppyYoung;
    if (lifeStage === 'puppy_kitten_older') return NUTRITION_FACTORS.dog.puppyOlder;
    if (lifeStage === 'senior') return NUTRITION_FACTORS.dog.senior;

    // Adult dog
    if (activityLevel === 'working') return NUTRITION_FACTORS.dog.working;
    if (activityLevel === 'high') return NUTRITION_FACTORS.dog.activeHigh;
    if (isNeutered) return NUTRITION_FACTORS.dog.adultNeutered;
    return NUTRITION_FACTORS.dog.adultIntact;
  }

  if (species === 'cat') {
    if (isWeightLoss) return NUTRITION_FACTORS.cat.weightLoss;
    if (isObeseProne || activityLevel === 'low') return NUTRITION_FACTORS.cat.inactiveObeseProne;
    if (lifeStage === 'puppy_kitten_young') return NUTRITION_FACTORS.cat.kittenYoung;
    if (lifeStage === 'puppy_kitten_older') return NUTRITION_FACTORS.cat.kittenOlder;
    if (lifeStage === 'senior') return NUTRITION_FACTORS.cat.senior;

    // Adult cat
    if (activityLevel === 'high') return NUTRITION_FACTORS.cat.activeHigh;
    if (isNeutered) return NUTRITION_FACTORS.cat.adultNeutered;
    return NUTRITION_FACTORS.cat.adultIntact;
  }

  if (species === 'bird') {
    if (lifeStage === 'puppy_kitten_young' || lifeStage === 'puppy_kitten_older') return NUTRITION_FACTORS.bird.young;
    if (lifeStage === 'senior') return NUTRITION_FACTORS.bird.senior;
    if (activityLevel === 'high' || activityLevel === 'working') return NUTRITION_FACTORS.bird.activeHigh;
    return NUTRITION_FACTORS.bird.adult;
  }

  if (species === 'hamster') {
    if (lifeStage === 'puppy_kitten_young' || lifeStage === 'puppy_kitten_older') return NUTRITION_FACTORS.hamster.young;
    if (lifeStage === 'senior') return NUTRITION_FACTORS.hamster.senior;
    if (activityLevel === 'high' || activityLevel === 'working') return NUTRITION_FACTORS.hamster.activeHigh;
    return NUTRITION_FACTORS.hamster.adult;
  }

  // Rabbit
  if (isWeightLoss) return NUTRITION_FACTORS.rabbit.weightLoss;
  if (isObeseProne || activityLevel === 'low') return NUTRITION_FACTORS.rabbit.inactiveObeseProne;
  if (lifeStage === 'puppy_kitten_young' || lifeStage === 'puppy_kitten_older') return NUTRITION_FACTORS.rabbit.young;
  if (lifeStage === 'senior') return NUTRITION_FACTORS.rabbit.senior;
  if (activityLevel === 'high' || activityLevel === 'working') return NUTRITION_FACTORS.rabbit.activeHigh;
  if (isNeutered) return NUTRITION_FACTORS.rabbit.adultNeutered;
  return NUTRITION_FACTORS.rabbit.adultIntact;
}

/**
 * Convert calories to dry food grams (assumes standard ~370 kcal/100g kibble)
 */
export function calculateDryFoodGrams(kcal: number): number {
  return Math.round((kcal / 370) * 100);
}

/**
 * Convert calories to wet food grams (assumes standard ~100 kcal/100g pate)
 */
export function calculateWetFoodGrams(kcal: number): number {
  return Math.round((kcal / 100) * 100);
}

/**
 * Pure function: Calculate full breed-aware nutritional recommendation
 */
export function calculateNutrition(input: NutritionCalculationInput): NutritionCalculationResult {
  const rer = calculateRER(input.weightKg, input.species);
  const baseFactor = determineActivityFactor(input);

  // Look up specialized breed profile from 53-breed dataset
  const breedProfile = findBreedNutritionProfile(input.breedKey || input.breedName);
  const breedModifier = breedProfile ? breedProfile.metabolicModifier : 1.0;

  // Effective Factor = Base Factor * Breed Metabolic Modifier
  const effectiveFactor = Math.round(baseFactor * breedModifier * 100) / 100;
  const mer = Math.round(rer * effectiveFactor);

  // Recommended meals per day
  let mealsPerDay = 2;
  if (input.species === 'bird' || input.species === 'hamster') {
    mealsPerDay = 2;
  } else if (input.species === 'rabbit') {
    mealsPerDay = 2; // Cỏ khô không giới hạn + 2 lần bữa rau/viên
  } else if (input.lifeStage === 'puppy_kitten_young') {
    mealsPerDay = 4;
  } else if (input.lifeStage === 'puppy_kitten_older') {
    mealsPerDay = 3;
  } else if (breedProfile?.sizeCategory === 'toy') {
    // Toy breeds have small stomachs and need 3 meals to prevent hypoglycemia
    mealsPerDay = 3;
  }

  // Water requirement (~55ml per kg or ~0.95ml per kcal MER)
  const waterMl = Math.round(Math.max(input.weightKg * 55, mer * 0.95));

  // Portion Calculations
  const dryFoodGrams = calculateDryFoodGrams(mer);
  const wetFoodGrams = calculateWetFoodGrams(mer);

  // Optimal diet ratio (default to breed recommended wet ratio or species default)
  const defaultWetRatio =
    input.species === 'cat'
      ? 0.6
      : input.species === 'bird'
      ? 0.2
      : input.species === 'rabbit' || input.species === 'hamster'
      ? 0.1
      : 0.3;
  const wetRatio = breedProfile ? breedProfile.recommendedWetRatio : defaultWetRatio;
  const optimalDryCal = mer * (1 - wetRatio);
  const optimalWetCal = mer * wetRatio;

  const optimalDiet = {
    dryGrams: calculateDryFoodGrams(optimalDryCal),
    wetGrams: calculateWetFoodGrams(optimalWetCal),
    wetPercentage: Math.round(wetRatio * 100),
  };

  // Macro-nutrient distribution
  const defaultMacro =
    input.species === 'cat'
      ? { proteinPercent: 40, fatPercent: 30, carbsPercent: 30 }
      : input.species === 'bird'
      ? { proteinPercent: 15, fatPercent: 8, carbsPercent: 77 }
      : input.species === 'hamster'
      ? { proteinPercent: 18, fatPercent: 6, carbsPercent: 76 }
      : input.species === 'rabbit'
      ? { proteinPercent: 14, fatPercent: 3, carbsPercent: 83 }
      : { proteinPercent: 26, fatPercent: 15, carbsPercent: 59 };
  const macroRatio = breedProfile ? breedProfile.macroRatio : defaultMacro;

  // Explanatory summaries
  const speciesViLabels: Record<string, string> = {
    dog: 'chó',
    cat: 'mèo',
    bird: 'chim',
    hamster: 'hamster',
    rabbit: 'thỏ',
  };
  const breedTitle = breedProfile ? `giống ${breedProfile.nameVi}` : speciesViLabels[input.species] || 'thú cưng';
  const summaryVi = `Khẩu phần khuyến nghị cho ${breedTitle} (${input.weightKg} kg): ${mer} kcal/ngày, chia làm ${mealsPerDay} bữa.`;

  const modifierNote =
    breedProfile && breedModifier !== 1.0
      ? ` × hệ số giống ${breedProfile.nameEn} (${breedModifier}x)`
      : '';
  const rerFormula = input.species === 'bird' ? '78' : '70';
  const formulaExplanationVi = `RER = ${rerFormula} × (${input.weightKg})^0.75 = ${rer} kcal. Hệ số duy trì MER = ${baseFactor}x${modifierNote} = ${effectiveFactor}x. Tổng năng lượng cần nạp = ${mer} kcal/ngày.`;

  return {
    weightKg: input.weightKg,
    rerKcal: rer,
    activityFactor: effectiveFactor,
    merKcal: mer,
    recommendedMealsPerDay: mealsPerDay,
    recommendedWaterMlPerDay: waterMl,
    summaryVi,
    formulaExplanationVi,
    breedProfile,
    breedModifier,
    dryFoodGrams,
    wetFoodGrams,
    optimalDiet,
    macroRatio,
  };
}
