
"""
Nutrition rules for DACN2 Pet Care.
Each rule includes a source for traceability.

These are general educational rules, not a veterinary diagnosis
or a personalized feeding prescription.
"""

NUTRITION_RULES = [
    # DOG
    {
        "rule_id": "DOG-001",
        "species": "dog",
        "condition": "general",
        "recommendation": (
            "Chon thuc an hoan chinh va can doi, phu hop voi "
            "giai doan song cua cho."
        ),
        "warning": (
            "Nhu cau thuc te con phu thuoc vao tinh trang co the, "
            "van dong va suc khoe."
        ),
        "source_name": "WSAVA Global Nutrition Guidelines",
        "source_url": (
            "https://wsava.org/Global-Guidelines/"
            "Global-Nutrition-Guidelines/"
        ),
    },
    {
        "rule_id": "DOG-002",
        "species": "dog",
        "condition": "underweight",
        "recommendation": (
            "Can danh gia tinh trang dinh duong va nguyen nhan "
            "truoc khi dieu chinh khau phan."
        ),
        "warning": (
            "Neu sut can khong ro nguyen nhan hoac kem dau hieu "
            "bat thuong, nen lien he bac si thu y."
        ),
        "source_name": "WSAVA Global Nutrition Guidelines",
        "source_url": (
            "https://wsava.org/Global-Guidelines/"
            "Global-Nutrition-Guidelines/"
        ),
    },

    # CAT
    {
        "rule_id": "CAT-001",
        "species": "cat",
        "condition": "general",
        "recommendation": (
            "Chon thuc an hoan chinh, can doi va phu hop voi "
            "giai doan song cua meo; dam bao nhu cau dinh duong "
            "dac thu cua meo."
        ),
        "warning": (
            "Khong dung quy tac dinh duong cua cho de thay the "
            "cho nhu cau rieng cua meo."
        ),
        "source_name": "Merck Veterinary Manual",
        "source_url": (
            "https://www.merckvetmanual.com/management-and-nutrition/"
            "nutrition-small-animals/nutritional-requirements-of-small-animals"
        ),
    },
    {
        "rule_id": "CAT-002",
        "species": "cat",
        "condition": "overweight",
        "recommendation": (
            "Can danh gia tinh trang co the va khau phan hien tai "
            "truoc khi lap ke hoach kiem soat can nang."
        ),
        "warning": (
            "Khong tu y cat giam thuc an qua muc; thay doi che do "
            "an cua meo can duoc thuc hien than trong."
        ),
        "source_name": "WSAVA Global Nutrition Guidelines",
        "source_url": (
            "https://wsava.org/Global-Guidelines/"
            "Global-Nutrition-Guidelines/"
        ),
    },
]


def get_rules_for_species(species: str) -> list[dict]:
    """Return all nutrition rules belonging to a species."""
    normalized_species = species.strip().lower()
    return [
        rule for rule in NUTRITION_RULES
        if rule["species"] == normalized_species
    ]


def get_rule_by_id(rule_id: str) -> dict | None:
    """Find one nutrition rule by its unique ID."""
    for rule in NUTRITION_RULES:
        if rule["rule_id"] == rule_id:
            return rule
    return None
