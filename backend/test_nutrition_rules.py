
import unittest

from app.schemas.nutrition import NutritionRequest
from app.services.nutrition_engine import evaluate_nutrition_profile


def make_pet(**overrides):
    data = {
        "species": "dog",
        "breed": "beagle",
        "age_months": 24,
        "weight_kg": 12,
        "life_stage": "adult",
        "activity_level": "moderate",
        "body_condition": "ideal",
        "health_notes": None,
    }
    data.update(overrides)
    return NutritionRequest(**data)


class NutritionRulesTests(unittest.TestCase):

    def test_dog_ideal_applies_general_rule(self):
        result = evaluate_nutrition_profile(make_pet())

        rule_ids = {
            rule["rule_id"]
            for rule in result["nutrition_rules"]
        }

        self.assertIn("DOG-001", rule_ids)
        self.assertEqual(result["species"], "dog")

    def test_underweight_dog_applies_specific_rule(self):
        result = evaluate_nutrition_profile(
            make_pet(body_condition="underweight")
        )

        rule_ids = {
            rule["rule_id"]
            for rule in result["nutrition_rules"]
        }

        self.assertIn("DOG-001", rule_ids)
        self.assertIn("DOG-002", rule_ids)

    def test_overweight_cat_applies_specific_rule(self):
        result = evaluate_nutrition_profile(
            make_pet(
                species="cat",
                breed="domestic shorthair",
                weight_kg=4,
                body_condition="overweight",
            )
        )

        rule_ids = {
            rule["rule_id"]
            for rule in result["nutrition_rules"]
        }

        self.assertIn("CAT-001", rule_ids)
        self.assertIn("CAT-002", rule_ids)

    def test_sources_have_names_and_urls(self):
        result = evaluate_nutrition_profile(make_pet())

        self.assertTrue(result["sources"])

        for source in result["sources"]:
            self.assertTrue(source.get("name"))
            self.assertTrue(
                source.get("url", "").startswith("https://")
            )

    def test_warnings_are_not_exact_duplicates(self):
        result = evaluate_nutrition_profile(
            make_pet(body_condition="overweight")
        )

        self.assertEqual(
            len(result["warnings"]),
            len(set(result["warnings"])),
        )

    def test_status_is_preliminary(self):
        result = evaluate_nutrition_profile(make_pet())

        self.assertEqual(
            result["recommendation_status"],
            "preliminary_assessment",
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
