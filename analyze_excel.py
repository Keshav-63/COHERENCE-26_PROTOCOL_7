"""
Script to analyze the allsbe.xlsx Excel file structure
"""
import pandas as pd
import sys

try:
    # Load Excel file
    xl = pd.ExcelFile('allsbe.xlsx')

    print("="*80)
    print("EXCEL FILE ANALYSIS: allsbe.xlsx")
    print("="*80)
    print(f"\nTotal Sheets: {len(xl.sheet_names)}")
    print("\nSheet Names:")
    for i, sheet in enumerate(xl.sheet_names, 1):
        print(f"  {i}. {sheet}")

    print("\n" + "="*80)
    print("DETAILED SHEET ANALYSIS (First 3 sheets)")
    print("="*80)

    # Analyze first 3 sheets
    for sheet_name in xl.sheet_names[:3]:
        print(f"\n{'='*80}")
        print(f"Sheet: {sheet_name}")
        print(f"{'='*80}")

        # Read sheet
        df = pd.read_excel('allsbe.xlsx', sheet_name=sheet_name, nrows=10)

        print(f"\nShape: {df.shape[0]} rows x {df.shape[1]} columns")
        print(f"\nColumns ({len(df.columns)}):")
        for i, col in enumerate(df.columns, 1):
            print(f"  {i}. {col}")

        print(f"\nFirst 5 rows:")
        print(df.head())

        print(f"\nData Types:")
        print(df.dtypes)

        print(f"\nNull Values:")
        print(df.isnull().sum())

    # Summary of all sheets
    print("\n" + "="*80)
    print("ALL SHEETS SUMMARY")
    print("="*80)
    for sheet_name in xl.sheet_names:
        df = pd.read_excel('allsbe.xlsx', sheet_name=sheet_name, nrows=1)
        print(f"\n{sheet_name}:")
        print(f"  - Columns: {df.shape[1]}")
        print(f"  - Column names: {', '.join(list(df.columns)[:5])}...")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
