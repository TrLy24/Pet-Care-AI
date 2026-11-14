
from app.schemas.nutrition import NutritionRequest
from app.services.nutrition_engine import evaluate_nutrition_profile

test_cases = [
    {
        "species": "dog",
        "breed": "beagle",
        "age_months": 24,
        "weight_kg": 12,
        "life_stage": "adult",
        "activity_level": "moderate",
        "body_condition": "ideal",
    },
    {
        "species": "cat",
        "breed": "domestic shorthair",
        "age_months": 18,
        "weight_kg": 4,
        "life_stage": "adult",
        "activity_level": "moderate",
        "body_condition": "overweight",
    },
]

print("=== KIEM THU DINH DUONG CHO & MEO ===")

for data in test_cases:
    pet = NutritionRequest(**data)
    result = evaluate_nutrition_profile(pet)

    print(f"\nLoai: {result['species_vi']}")
    print(f"Trang thai: {result['recommendation_status']}")
    print(f"So quy tac ap dung: {len(result['nutrition_rules'])}")
    print(f"So nguon tham khao: {len(result['sources'])}")

    for rule in result["nutrition_rules"]:
        print(f"  - {rule['rule_id']}: {rule['recommendation']}")

    for warning in result["warnings"]:
        print(f"  ! {warning}")

print("\n=== HOAN TAT KIEM THU ===")
