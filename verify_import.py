"""
Verify Budget Data Import
Check what was imported into MongoDB
"""

import asyncio
from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.budget.models import Ministry, Scheme, BudgetAllocation

async def verify_import():
    """Verify imported data"""
    print("="*80)
    print("VERIFYING BUDGET DATA IMPORT")
    print("="*80)

    await connect_to_mongodb()

    # Count documents
    ministry_count = await Ministry.count()
    scheme_count = await Scheme.count()
    allocation_count = await BudgetAllocation.count()

    print(f"\nDocument Counts:")
    print(f"  Ministries: {ministry_count}")
    print(f"  Schemes: {scheme_count}")
    print(f"  Budget Allocations: {allocation_count}")

    # Show sample ministries
    print(f"\n{'='*80}")
    print("SAMPLE MINISTRIES (First 10)")
    print("="*80)
    ministries = await Ministry.find().limit(10).to_list()
    for ministry in ministries:
        print(f"  {ministry.ministry_code}: {ministry.ministry_name}")

    # Show sample schemes
    print(f"\n{'='*80}")
    print("SAMPLE SCHEMES (First 10)")
    print("="*80)
    schemes = await Scheme.find().limit(10).to_list()
    for scheme in schemes:
        print(f"  {scheme.scheme_code}: {scheme.scheme_name[:60]} ({scheme.ministry_name[:40]})")

    # Show sample budget allocations
    print(f"\n{'='*80}")
    print("SAMPLE BUDGET ALLOCATIONS (First 10)")
    print("="*80)
    allocations = await BudgetAllocation.find().limit(10).to_list()
    for allocation in allocations:
        be = allocation.budget_estimate if allocation.budget_estimate else 0
        print(f"  {allocation.allocation_code}: {allocation.scheme_name[:50]}")
        print(f"    FY: {allocation.fiscal_year}, BE: Rs.{be:.2f} Cr")

    # Group by fiscal year
    print(f"\n{'='*80}")
    print("BUDGET ALLOCATIONS BY FISCAL YEAR")
    print("="*80)

    for fy in ["2024-25", "2025-26", "2026-27"]:
        count = await BudgetAllocation.find(BudgetAllocation.fiscal_year == fy).count()
        allocations_fy = await BudgetAllocation.find(BudgetAllocation.fiscal_year == fy).to_list()
        total_budget = sum([a.budget_estimate for a in allocations_fy if a.budget_estimate])
        print(f"  FY {fy}: {count} allocations, Total: Rs.{total_budget:,.2f} Cr")

    # Top 10 schemes by budget (FY 2026-27)
    print(f"\n{'='*80}")
    print("TOP 10 SCHEMES BY BUDGET (FY 2026-27)")
    print("="*80)

    allocations_2026 = await BudgetAllocation.find(
        BudgetAllocation.fiscal_year == "2026-27"
    ).to_list()

    # Sort by budget_estimate
    allocations_2026_sorted = sorted(
        [a for a in allocations_2026 if a.budget_estimate],
        key=lambda x: x.budget_estimate,
        reverse=True
    )[:10]

    for idx, allocation in enumerate(allocations_2026_sorted, 1):
        print(f"  {idx}. {allocation.scheme_name[:50]}")
        print(f"     Ministry: {allocation.ministry_name[:50]}")
        print(f"     Budget: Rs.{allocation.budget_estimate:,.2f} Cr")

    await close_mongodb_connection()

    print(f"\n{'='*80}")
    print("VERIFICATION COMPLETED!")
    print("="*80)

if __name__ == "__main__":
    asyncio.run(verify_import())
