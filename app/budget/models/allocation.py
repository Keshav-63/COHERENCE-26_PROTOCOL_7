"""
Budget Allocation and Expenditure Models
Tracks budget allocations and actual expenditures
"""

from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field
from enum import Enum


class FiscalYear(str, Enum):
    """Fiscal year enumeration"""
    FY_2023_24 = "2023-24"
    FY_2024_25 = "2024-25"
    FY_2025_26 = "2025-26"
    FY_2026_27 = "2026-27"


class BudgetType(str, Enum):
    """Budget type enumeration"""
    REVENUE = "revenue"
    CAPITAL = "capital"
    PLAN = "plan"
    NON_PLAN = "non_plan"


class AllocationStatus(str, Enum):
    """Allocation status"""
    ALLOCATED = "allocated"
    REVISED = "revised"
    ACTUAL = "actual"


class BudgetAllocation(Document):
    """
    Budget Allocation for a specific fiscal year

    All amounts are in crores (₹ Cr.)
    """

    # Basic Information
    allocation_code: Indexed(str, unique=True)
    fiscal_year: Indexed(str)  # FiscalYear enum stored as string
    allocation_status: str  # AllocationStatus enum stored as string

    # Entity Reference (can be Ministry, Department, or Scheme)
    entity_type: str  # "ministry", "department", "scheme", "subscheme"
    entity_id: str
    entity_code: Indexed(str)
    entity_name: str  # Denormalized

    # Ministry/Department Hierarchy (denormalized for fast queries)
    ministry_code: Indexed(str)
    ministry_name: str
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    scheme_code: Optional[str] = None
    scheme_name: Optional[str] = None

    # Budget Type
    budget_type: str  # BudgetType enum stored as string

    # Financial Figures (all in crores ₹)
    budget_estimate: float  # BE - Initial allocation
    revised_estimate: Optional[float] = None  # RE - Mid-year revision
    actual_expenditure: Optional[float] = None  # Actual spent

    # Additional Financial Details
    previous_year_actual: Optional[float] = None  # Last year's actual expenditure
    gross_budgetary_support: Optional[float] = None  # GBS
    internal_and_extra_budgetary_resources: Optional[float] = None  # IEBR

    # Utilization Metrics
    utilization_percentage: Optional[float] = None  # (Actual / BE) * 100
    savings: Optional[float] = None  # BE - Actual (if positive)
    excess: Optional[float] = None  # Actual - BE (if positive)

    # State-specific (for state budgets)
    state_code: Optional[str] = None
    state_name: Optional[str] = None

    # Notes and Remarks
    remarks: Optional[str] = None
    notable_changes: Optional[str] = None  # Significant changes from previous year

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "budget_allocations"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("allocation_code", 1)],
            [("fiscal_year", 1), ("entity_type", 1)],
            [("ministry_code", 1), ("fiscal_year", 1)],
            [("scheme_code", 1), ("fiscal_year", 1)],
            [("state_code", 1), ("fiscal_year", 1)],
            [("allocation_status", 1)],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "allocation_code": "ALLOC-PMKISAN-2024-25",
                "fiscal_year": "2024-25",
                "allocation_status": "allocated",
                "entity_type": "scheme",
                "entity_code": "PM-KISAN-2019",
                "entity_name": "Pradhan Mantri Kisan Samman Nidhi",
                "ministry_code": "MOAFW-001",
                "ministry_name": "Ministry of Agriculture and Farmers Welfare",
                "budget_type": "revenue",
                "budget_estimate": 60000.00,
                "previous_year_actual": 55000.00
            }
        }

    def calculate_utilization(self) -> Optional[float]:
        """Calculate utilization percentage"""
        if self.actual_expenditure and self.budget_estimate:
            return (self.actual_expenditure / self.budget_estimate) * 100
        return None


class Expenditure(Document):
    """
    Monthly/Quarterly Expenditure Tracking

    Tracks granular expenditure data for real-time monitoring
    """

    # Basic Information
    expenditure_code: Indexed(str, unique=True)
    fiscal_year: Indexed(str)  # FiscalYear enum stored as string
    month: int  # 1-12
    quarter: int  # 1-4

    # Entity Reference
    allocation_id: str  # Reference to BudgetAllocation
    entity_type: str
    entity_code: Indexed(str)
    entity_name: str

    # Ministry/Department Hierarchy
    ministry_code: Indexed(str)
    department_code: Optional[str] = None
    scheme_code: Optional[str] = None

    # Expenditure Details (in crores)
    expenditure_amount: float
    cumulative_expenditure: float  # Total from April to current month

    # Budget vs Actual
    monthly_budget: Optional[float] = None  # Allocated for this month
    variance: Optional[float] = None  # Actual - Budget

    # Payment Details
    number_of_transactions: Optional[int] = None
    number_of_beneficiaries: Optional[int] = None

    # State-specific
    state_code: Optional[str] = None
    state_name: Optional[str] = None

    # Timestamps
    recorded_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "expenditures"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("expenditure_code", 1)],
            [("fiscal_year", 1), ("month", 1)],
            [("entity_code", 1), ("fiscal_year", 1)],
            [("ministry_code", 1), ("fiscal_year", 1), ("month", 1)],
            [("recorded_at", -1)],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "expenditure_code": "EXP-PMKISAN-2024-09",
                "fiscal_year": "2024-25",
                "month": 9,
                "quarter": 3,
                "entity_type": "scheme",
                "entity_code": "PM-KISAN-2019",
                "entity_name": "PM-KISAN",
                "ministry_code": "MOAFW-001",
                "expenditure_amount": 4500.00,
                "cumulative_expenditure": 27000.00,
                "number_of_beneficiaries": 11000000
            }
        }
