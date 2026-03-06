"""
Check if data is actually in MongoDB
"""

import asyncio
from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.budget.models import Ministry, Scheme, BudgetAllocation

async def check_mongodb():
    """Check MongoDB data"""
    print("="*80)
    print("CHECKING MONGODB DATABASE")
    print("="*80)

    try:
        await connect_to_mongodb()
        print("\n[OK] Connected to MongoDB successfully")

        # Count documents
        ministry_count = await Ministry.count()
        scheme_count = await Scheme.count()
        allocation_count = await BudgetAllocation.count()

        print(f"\nDocument Counts in MongoDB:")
        print(f"  Ministries: {ministry_count}")
        print(f"  Schemes: {scheme_count}")
        print(f"  Budget Allocations: {allocation_count}")

        if ministry_count > 0:
            print(f"\n[OK] Data is present in MongoDB!")
            print(f"\nSample Ministries:")
            ministries = await Ministry.find().limit(5).to_list()
            for m in ministries:
                print(f"  - {m.ministry_code}: {m.ministry_name}")

            print(f"\nSample Schemes:")
            schemes = await Scheme.find().limit(5).to_list()
            for s in schemes:
                print(f"  - {s.scheme_code}: {s.scheme_name[:60]}")

            print(f"\nSample Allocations:")
            allocations = await BudgetAllocation.find().limit(5).to_list()
            for a in allocations:
                print(f"  - {a.allocation_code}: FY {a.fiscal_year}, Budget: Rs.{a.budget_estimate if a.budget_estimate else 0:.2f} Cr")
        else:
            print(f"\n[WARNING] No data found in MongoDB!")
            print(f"You may need to run: python import_budget_data_v2.py")

        await close_mongodb_connection()

    except Exception as e:
        print(f"\n[ERROR] Failed to connect to MongoDB: {e}")
        print(f"\nMake sure:")
        print(f"  1. MongoDB is running")
        print(f"  2. Connection string is correct in .env file")

    print("\n" + "="*80)

if __name__ == "__main__":
    asyncio.run(check_mongodb())
