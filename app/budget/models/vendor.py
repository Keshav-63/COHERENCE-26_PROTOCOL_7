"""
Vendor and Contract Models
Tracks vendors, contracts, and their geographical operations
"""

from datetime import datetime, date
from typing import Optional, List
from beanie import Document, Indexed
from pydantic import Field, EmailStr
from enum import Enum


class VendorType(str, Enum):
    """Vendor type enumeration"""
    INDIVIDUAL = "individual"
    PRIVATE_COMPANY = "private_company"
    PUBLIC_SECTOR = "public_sector"
    NGO = "ngo"
    COOPERATIVE = "cooperative"
    PARTNERSHIP = "partnership"


class VendorStatus(str, Enum):
    """Vendor status"""
    ACTIVE = "active"
    BLACKLISTED = "blacklisted"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"


class ContractStatus(str, Enum):
    """Contract status"""
    AWARDED = "awarded"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    TERMINATED = "terminated"
    UNDER_DISPUTE = "under_dispute"


class Vendor(Document):
    """
    Vendor/Contractor who receives government contracts
    """

    # Basic Information
    vendor_code: Indexed(str, unique=True)
    vendor_name: str
    vendor_type: VendorType
    vendor_status: VendorStatus = VendorStatus.ACTIVE

    # Registration Details
    pan_number: Optional[str] = None
    gst_number: Optional[str] = None
    cin_number: Optional[str] = None  # Corporate Identification Number
    registration_number: Optional[str] = None

    # Contact Information
    registered_address: str
    city: str
    state_code: Indexed(str)
    state_name: str
    pincode: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    website_url: Optional[str] = None

    # Business Details
    nature_of_business: Optional[str] = None
    categories: Optional[List[str]] = []  # Construction, IT Services, Consulting, etc.
    annual_turnover: Optional[float] = None  # In crores

    # Government Empanelment
    empanelment_category: Optional[str] = None  # Class A, B, C, etc.
    empanelment_validity: Optional[date] = None

    # Performance Metrics
    total_contracts_awarded: int = 0
    total_contract_value: float = 0.0  # In crores
    completed_contracts: int = 0
    ongoing_contracts: int = 0
    performance_rating: Optional[float] = None  # 1-5 scale

    # Compliance
    is_msme: bool = False
    is_startup: bool = False
    belongs_to_sc_st: bool = False
    belongs_to_women_owned: bool = False

    # Blacklist Information
    blacklist_reason: Optional[str] = None
    blacklist_date: Optional[datetime] = None
    blacklist_duration_months: Optional[int] = None

    # Timestamps
    registered_date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "vendors"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("vendor_code", 1)],
            [("vendor_status", 1)],
            [("state_code", 1)],
            [("vendor_name", "text")],
            [("pan_number", 1)],
            [("gst_number", 1)],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "vendor_code": "VEND-MH-12345",
                "vendor_name": "ABC Construction Pvt Ltd",
                "vendor_type": "private_company",
                "vendor_status": "active",
                "state_code": "MH",
                "state_name": "Maharashtra",
                "city": "Mumbai",
                "total_contracts_awarded": 15,
                "total_contract_value": 250.50,
                "is_msme": True
            }
        }


class Contract(Document):
    """
    Contract/Work Order awarded to vendors

    Tracks contract details, payments, and geographical operational areas
    """

    # Basic Information
    contract_code: Indexed(str, unique=True)
    contract_number: str  # Official contract/work order number
    contract_title: str
    contract_status: ContractStatus

    # Vendor Information
    vendor_id: str
    vendor_code: Indexed(str)
    vendor_name: str  # Denormalized

    # Government Entity Awarding Contract
    ministry_code: Indexed(str)
    ministry_name: str
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    scheme_code: Optional[str] = None
    scheme_name: Optional[str] = None

    # Financial Details (in crores)
    contract_value: float
    advance_payment: Optional[float] = None
    total_paid: float = 0.0
    pending_payment: Optional[float] = None
    retention_money: Optional[float] = None  # Amount held back

    # Timeline
    award_date: date
    start_date: date
    completion_date: date
    actual_completion_date: Optional[date] = None
    duration_months: int

    # Extension Details
    extension_granted: bool = False
    extended_completion_date: Optional[date] = None
    extension_reason: Optional[str] = None

    # Geographical Operation Area
    operation_state_code: Indexed(str)
    operation_state_name: str
    operation_district_code: Optional[str] = None
    operation_district_name: Optional[str] = None
    operation_location: Optional[str] = None  # Village/Town/City

    # Geo-coordinates (for mapping)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geo_location: Optional[dict] = None  # GeoJSON format

    # Work/Service Details
    work_category: str  # Construction, IT, Consulting, Supply, etc.
    work_description: Optional[str] = None
    deliverables: Optional[List[str]] = []

    # Performance Tracking
    completion_percentage: float = 0.0
    quality_rating: Optional[float] = None  # 1-5 scale
    delays_in_days: int = 0
    penalties_imposed: float = 0.0  # In crores

    # Milestones
    total_milestones: int = 0
    completed_milestones: int = 0
    current_milestone: Optional[str] = None

    # Fiscal Year
    fiscal_year: str  # "2024-25"

    # Documents
    contract_document_url: Optional[str] = None
    work_order_url: Optional[str] = None
    completion_certificate_url: Optional[str] = None

    # Audit and Compliance
    last_audit_date: Optional[date] = None
    audit_findings: Optional[List[str]] = []
    compliance_issues: Optional[List[str]] = []

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "contracts"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("contract_code", 1)],
            [("vendor_code", 1), ("contract_status", 1)],
            [("ministry_code", 1), ("fiscal_year", 1)],
            [("scheme_code", 1)],
            [("operation_state_code", 1)],
            [("contract_status", 1)],
            [("award_date", -1)],
            [("geo_location", "2dsphere")],  # For geo-spatial queries
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "contract_code": "CONT-PMGSY-MH-2024-001",
                "contract_number": "PMGSY/MH/WO/2024/001",
                "contract_title": "Construction of Rural Road in Pune District",
                "contract_status": "in_progress",
                "vendor_code": "VEND-MH-12345",
                "vendor_name": "ABC Construction Pvt Ltd",
                "ministry_code": "MORD-001",
                "ministry_name": "Ministry of Rural Development",
                "scheme_code": "PMGSY-2000",
                "scheme_name": "Pradhan Mantri Gram Sadak Yojana",
                "contract_value": 15.50,
                "total_paid": 7.75,
                "operation_state_code": "MH",
                "operation_state_name": "Maharashtra",
                "operation_district_name": "Pune",
                "latitude": 18.5204,
                "longitude": 73.8567,
                "completion_percentage": 50.0,
                "fiscal_year": "2024-25"
            }
        }

    def calculate_pending_payment(self) -> float:
        """Calculate pending payment"""
        return self.contract_value - self.total_paid
