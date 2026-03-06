"""
Test Budget Models
Verify that all budget models can be imported and initialized correctly
"""

import asyncio
import sys

async def test_models():
    """Test model imports and basic operations"""
    print("="*80)
    print("TESTING BUDGET MODELS")
    print("="*80)

    print("\n1. Testing imports...")
    try:
        from app.core.database import connect_to_mongodb, close_mongodb_connection
        print("   [OK] Database module imported")

        from app.budget.models import (
            Ministry, Department, Scheme, SubScheme,
            BudgetAllocation, Expenditure,
            Vendor, Contract,
            State, District, Location
        )
        print("   [OK] All budget models imported successfully")

        from app.budget.models.ministry import GovernmentLevel
        from app.budget.models.scheme import SchemeType, SchemeStatus
        from app.budget.models.allocation import FiscalYear, BudgetType, AllocationStatus
        print("   [OK] All enums imported successfully")

    except ImportError as e:
        print(f"   [ERROR] Import error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

    print("\n2. Connecting to MongoDB...")
    try:
        await connect_to_mongodb()
        print("   [OK] Connected to MongoDB successfully")
    except Exception as e:
        print(f"   [ERROR] Connection error: {str(e)}")
        return False

    print("\n3. Testing model creation...")
    try:
        # Test Ministry creation
        ministry = Ministry(
            ministry_code="TEST-MIN-001",
            ministry_name="Test Ministry of Finance",
            ministry_short_name="Test MoF",
            government_level="central",
            is_active=True
        )
        print(f"   [OK] Ministry model created: {ministry}")

        # Test Scheme creation
        scheme = Scheme(
            scheme_code="TEST-SCH-001",
            scheme_name="Test PM-KISAN",
            scheme_short_name="Test PM-KISAN",
            scheme_type="central_sector",
            scheme_status="active",
            ministry_id="test-ministry-id",
            ministry_code="TEST-MIN-001",
            ministry_name="Test Ministry of Finance"
        )
        print(f"   [OK] Scheme model created: {scheme}")

        # Test BudgetAllocation creation
        allocation = BudgetAllocation(
            allocation_code="TEST-ALLOC-001",
            fiscal_year="2024-25",
            allocation_status="allocated",
            entity_type="scheme",
            entity_id="test-id",
            entity_code="TEST-SCH-001",
            entity_name="Test Scheme",
            ministry_code="TEST-MIN-001",
            ministry_name="Test Ministry",
            budget_type="revenue",
            budget_estimate=60000.00
        )
        print(f"   [OK] BudgetAllocation model created")
        print(f"      Budget Estimate: Rs.{allocation.budget_estimate} Cr")

        # Test Vendor creation
        vendor = Vendor(
            vendor_code="TEST-VEND-001",
            vendor_name="Test ABC Construction",
            vendor_type="private_company",
            vendor_status="active",
            registered_address="Test Address",
            city="Mumbai",
            state_code="MH",
            state_name="Maharashtra"
        )
        print(f"   [OK] Vendor model created: {vendor}")

        # Test Contract creation
        from datetime import date
        contract = Contract(
            contract_code="TEST-CONT-001",
            contract_number="TEST/WO/2024/001",
            contract_title="Test Road Construction",
            contract_status="in_progress",
            vendor_id="test-vendor-id",
            vendor_code="TEST-VEND-001",
            vendor_name="Test ABC Construction",
            ministry_code="TEST-MIN-001",
            ministry_name="Test Ministry",
            contract_value=15.50,
            total_paid=7.75,
            award_date=date.today(),
            start_date=date.today(),
            completion_date=date.today(),
            duration_months=12,
            operation_state_code="MH",
            operation_state_name="Maharashtra",
            work_category="Construction",
            fiscal_year="2024-25"
        )
        print(f"   [OK] Contract model created")
        print(f"      Contract Value: Rs.{contract.contract_value} Cr")
        print(f"      Pending: Rs.{contract.calculate_pending_payment()} Cr")

    except Exception as e:
        print(f"   [ERROR] Model creation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

    print("\n4. Closing connection...")
    await close_mongodb_connection()
    print("   [OK] Connection closed")

    print("\n" + "="*80)
    print("ALL TESTS PASSED!")
    print("="*80)
    print("\nBudget models are working correctly.")
    print("You can now run: python run_import.py")
    print("="*80)

    return True


if __name__ == "__main__":
    try:
        result = asyncio.run(test_models())
        sys.exit(0 if result else 1)
    except Exception as e:
        print(f"\nTest failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
