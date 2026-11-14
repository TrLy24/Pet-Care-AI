
from typing import Literal

from pydantic import BaseModel, Field, model_validator


Species = Literal[
    "dog",
    "cat",
]

ActivityLevel = Literal[
    "low",
    "moderate",
    "high",
]

LifeStage = Literal[
    "baby",
    "adult",
    "senior",
]


class NutritionRequest(BaseModel):
    species: Species = Field(
        description="Loai thu cung"
    )

    breed: str | None = Field(
        default=None,
        max_length=100,
        description="Giong thu cung",
    )

    age_months: int = Field(
        gt=0,
        le=600,
        description="Tuoi tinh theo thang",
    )

    weight_kg: float = Field(
        gt=0,
        le=200,
        description="Can nang tinh theo kg",
    )

    life_stage: LifeStage

    activity_level: ActivityLevel

    body_condition: Literal[
        "underweight",
        "ideal",
        "overweight",
        "unknown",
    ] = "unknown"

    health_notes: str | None = Field(
        default=None,
        max_length=1000,
        description="Thong tin suc khoe do chu nuoi cung cap",
    )

    @model_validator(mode="after")
    def validate_species_input(self):
        if self.species == "cat" and self.weight_kg > 30:
            raise ValueError(
                "Can kiem tra lai can nang meo; "
                "gia tri tren 30 kg bat thuong."
            )

        if self.species == "dog" and self.weight_kg > 150:
            raise ValueError(
                "Can kiem tra lai can nang cho; "
                "gia tri tren 150 kg bat thuong."
            )

        return self
