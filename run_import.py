"""
Run Budget Data Import
Wrapper script to import budget data from Excel to MongoDB
"""

import sys
import asyncio

# Add project to path
sys.path.insert(0, '.')

from import_budget_data import main

if __name__ == "__main__":
    print("Starting budget data import...")
    print("This may take several minutes depending on the data size.")
    print("")

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nImport interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nImport failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
