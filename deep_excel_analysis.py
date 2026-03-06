"""
Deep Excel Analysis - Check actual data in sheets
"""

import pandas as pd
import numpy as np
import sys

# Fix Unicode encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def analyze_sheet_deeply(excel_file, sheet_name, max_rows=100):
    """Analyze a sheet in detail"""
    print(f"\n{'='*80}")
    print(f"DEEP ANALYSIS: {sheet_name}")
    print(f"{'='*80}")

    # Read without header to see raw data
    df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)

    print(f"\nTotal rows: {len(df)}")
    print(f"Total columns: {len(df.columns)}")

    # Check how many non-null cells
    total_cells = len(df) * len(df.columns)
    non_null_cells = df.count().sum()
    print(f"Non-null cells: {non_null_cells} / {total_cells} ({non_null_cells/total_cells*100:.1f}%)")

    # Show first 20 rows
    print(f"\nFirst 20 rows (showing non-empty cells):")
    for idx in range(min(20, len(df))):
        row_data = []
        for col_idx, val in enumerate(df.iloc[idx]):
            if pd.notna(val):
                # Replace rupee symbol and other unicode
                val_str = str(val)[:50].replace('\u20b9', 'Rs.')
                row_data.append(f"Col{col_idx}: {val_str}")
        if row_data:
            print(f"Row {idx}: {' | '.join(row_data)}")

    # Look for rows with numbers
    print(f"\nRows with numerical data (first 10):")
    count = 0
    for idx in range(min(max_rows, len(df))):
        has_number = False
        row_nums = []
        for col_idx, val in enumerate(df.iloc[idx]):
            if pd.notna(val) and isinstance(val, (int, float)) and not pd.isna(val):
                has_number = True
                row_nums.append(f"Col{col_idx}={val}")
        if has_number and count < 10:
            print(f"  Row {idx}: {', '.join(row_nums[:5])}")  # Limit to first 5 numbers
            count += 1

    if count == 0:
        print("  No numerical data found in first 100 rows")

if __name__ == "__main__":
    excel_file = 'allsbe.xlsx'

    # Analyze first 3 sheets in detail
    xl = pd.ExcelFile(excel_file)

    for sheet_name in xl.sheet_names[:3]:
        analyze_sheet_deeply(excel_file, sheet_name)

    print(f"\n{'='*80}")
    print("SUMMARY - All Sheets")
    print(f"{'='*80}")
    print(f"Total sheets: {len(xl.sheet_names)}")

    # Check size of each sheet
    print("\nSheet sizes (first 20):")
    for sheet_name in xl.sheet_names[:20]:
        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
        non_null = df.count().sum()
        print(f"  {sheet_name}: {len(df)} rows x {len(df.columns)} cols, {non_null} non-null cells")
