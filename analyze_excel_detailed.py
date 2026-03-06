"""
Detailed analysis of allsbe.xlsx to find actual headers and data
"""
import pandas as pd
import numpy as np

def find_header_row(df):
    """Find the row that contains headers"""
    for i in range(min(20, len(df))):
        row = df.iloc[i]
        # Check if row has more non-null values than others
        non_null_count = row.notna().sum()
        if non_null_count > len(df.columns) * 0.5:  # At least 50% filled
            return i
    return 0

print("="*80)
print("DETAILED ANALYSIS OF BUDGET DATA")
print("="*80)

# Analyze a few sheets to understand structure
for sheet_name in ['Sheet1', 'sbe1', 'sbe2', 'sbe4']:
    print(f"\n{'='*80}")
    print(f"Sheet: {sheet_name}")
    print(f"{'='*80}")

    try:
        # Read without headers first
        df_raw = pd.read_excel('allsbe.xlsx', sheet_name=sheet_name, header=None)

        print(f"\nRaw shape: {df_raw.shape}")
        print(f"\nFirst 20 rows:")
        print(df_raw.head(20))

        # Try to find header row
        header_row = find_header_row(df_raw)
        print(f"\nDetected header row: {header_row}")

        # Read again with detected header
        if header_row > 0:
            df = pd.read_excel('allsbe.xlsx', sheet_name=sheet_name, header=header_row)
            print(f"\nWith headers:")
            print(f"Shape: {df.shape}")
            print(f"Columns: {list(df.columns)}")
            print(f"\nFirst 10 data rows:")
            print(df.head(10))

            # Show non-null columns
            print(f"\nNon-null value counts:")
            print(df.count())

    except Exception as e:
        print(f"Error: {e}")

    print("\n")
