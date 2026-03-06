"""
Location Models
Represents geographical hierarchy: States, Districts, Locations
"""

from datetime import datetime
from typing import Optional, List
from beanie import Document, Indexed
from pydantic import Field


class State(Document):
    """
    Indian State or Union Territory
    """

    # Basic Information
    state_code: Indexed(str, unique=True)  # MH, DL, UP, etc.
    state_name: str
    state_type: str  # "state" or "union_territory"

    # Official Details
    capital_city: Optional[str] = None
    official_languages: Optional[List[str]] = []

    # Geography
    area_sq_km: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Demographics (as per latest census)
    population: Optional[int] = None
    population_density: Optional[float] = None  # per sq km
    literacy_rate: Optional[float] = None  # percentage
    urban_population_percentage: Optional[float] = None

    # Administrative
    total_districts: int = 0
    governor_name: Optional[str] = None
    chief_minister_name: Optional[str] = None  # Only for states

    # Economic
    gsdp: Optional[float] = None  # Gross State Domestic Product in crores
    per_capita_income: Optional[float] = None  # In rupees

    # Metadata
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "states"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("state_code", 1)],
            [("state_name", "text")],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "state_code": "MH",
                "state_name": "Maharashtra",
                "state_type": "state",
                "capital_city": "Mumbai",
                "total_districts": 36,
                "population": 112374333,
                "chief_minister_name": "Eknath Shinde"
            }
        }


class District(Document):
    """
    District within a State/UT
    """

    # Basic Information
    district_code: Indexed(str, unique=True)  # MH-PUN, MH-MUM, etc.
    district_name: str

    # State Reference
    state_code: Indexed(str)
    state_name: str

    # Administrative
    district_headquarters: Optional[str] = None
    collector_name: Optional[str] = None  # District Collector/Deputy Commissioner

    # Geography
    area_sq_km: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Demographics
    population: Optional[int] = None
    population_density: Optional[float] = None
    literacy_rate: Optional[float] = None
    urban_population_percentage: Optional[float] = None

    # Administrative Divisions
    total_tehsils: int = 0
    total_blocks: int = 0
    total_villages: int = 0

    # Metadata
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "districts"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("district_code", 1)],
            [("state_code", 1)],
            [("district_name", "text")],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "district_code": "MH-PUN",
                "district_name": "Pune",
                "state_code": "MH",
                "state_name": "Maharashtra",
                "district_headquarters": "Pune",
                "population": 9429408,
                "area_sq_km": 15642
            }
        }


class Location(Document):
    """
    Specific location (Village/Town/City/Project Site)
    Used for tracking project locations, contract sites, etc.
    """

    # Basic Information
    location_code: Indexed(str, unique=True)
    location_name: str
    location_type: str  # "village", "town", "city", "project_site", "office"

    # Hierarchy
    state_code: Indexed(str)
    state_name: str
    district_code: Indexed(str)
    district_name: str
    tehsil_name: Optional[str] = None
    block_name: Optional[str] = None

    # Address
    full_address: Optional[str] = None
    pincode: Optional[str] = None

    # Geo-coordinates (mandatory for mapping)
    latitude: float
    longitude: float
    geo_location: dict  # GeoJSON format for MongoDB geospatial queries

    # Project/Contract Association
    related_schemes: Optional[List[str]] = []  # Scheme codes
    related_contracts: Optional[List[str]] = []  # Contract codes

    # Additional Details
    population: Optional[int] = None
    description: Optional[str] = None

    # Metadata
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "locations"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("location_code", 1)],
            [("state_code", 1), ("district_code", 1)],
            [("geo_location", "2dsphere")],  # For geo-spatial queries
            [("location_name", "text")],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "location_code": "LOC-MH-PUN-001",
                "location_name": "Hadapsar",
                "location_type": "town",
                "state_code": "MH",
                "state_name": "Maharashtra",
                "district_code": "MH-PUN",
                "district_name": "Pune",
                "latitude": 18.5089,
                "longitude": 73.9260,
                "geo_location": {
                    "type": "Point",
                    "coordinates": [73.9260, 18.5089]
                },
                "pincode": "411028"
            }
        }
