"""
Improved Budget Data Import Script
Correctly extracts data based on actual Excel structure
"""

import pandas as pd
import numpy as np
import asyncio
import re
from datetime import datetime
from typing import Dict, List, Optional
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.budget.models import (
    Ministry, Department, Scheme, BudgetAllocation
)

class BudgetDataImporterV2:
    """Improved budget data importer"""

    def __init__(self, excel_file: str):
        self.excel_file = excel_file
        self.xl = pd.ExcelFile(excel_file)
        self.ministries = {}
        self.departments = {}
        self.schemes = {}
        self.allocations = []

        # Counters
        self.ministry_counter = 1
        self.department_counter = 1
        self.scheme_counter = 1
        self.allocation_counter = 1

    def clean_text(self, text: str) -> str:
        """Clean text data"""
        if pd.isna(text) or text is None:
            return ""
        text = str(text).strip()
        text = re.sub(r'\s+', ' ', text)
        text = text.replace('\n', ' ').replace('\r', ' ')
        # Remove numbering like "1.", "2.", etc.
        text = re.sub(r'^\d+\.\s*', '', text)
        return text

    def extract_number(self, value) -> Optional[float]:
        """Extract numerical value"""
        if pd.isna(value) or value is None or value == '' or value == '...':
            return None

        if isinstance(value, (int, float)):
            return float(value) if value != 0 else None

        value_str = str(value).strip()
        if value_str == '...' or value_str == '-':
            return None

        try:
            value_str = value_str.replace(',', '')
            match = re.search(r'-?\d+\.?\d*', value_str)
            if match:
                num = float(match.group())
                return num if num != 0 else None
        except:
            pass

        return None

    def find_ministry_from_sheet1(self, sheet_name: str) -> Optional[str]:
        """Find ministry name from Sheet1 based on demand number"""
        try:
            # Extract demand number from sheet name (e.g., "sbe1" -> "1")
            match = re.search(r'sbe(\d+)', sheet_name.lower())
            if not match:
                return None

            demand_num = int(match.group(1))

            # Read Sheet1
            df = pd.read_excel(self.excel_file, sheet_name='Sheet1', header=None)

            # Look for demand number in column 2 or 3
            for idx, row in df.iterrows():
                # Check if row contains the demand number followed by ministry name
                for col in [2, 3]:
                    if col < len(row):
                        cell_value = row[col]
                        if pd.notna(cell_value):
                            cell_str = str(cell_value)
                            # Look for pattern like "1. Department Name" or just "Department Name" with demand number
                            if str(demand_num) + '.' in cell_str or (idx > 0 and str(demand_num) + '.' in str(row[2])):
                                ministry = self.clean_text(cell_value)
                                if len(ministry) > 10:
                                    return ministry

            return None

        except Exception as e:
            logger.debug(f"Could not find ministry for {sheet_name}: {e}")
            return None

    def parse_sheet(self, sheet_name: str) -> List[Dict]:
        """Parse a single sheet"""
        logger.info(f"Parsing sheet: {sheet_name}")

        try:
            # Read sheet
            df = pd.read_excel(self.excel_file, sheet_name=sheet_name, header=None)

            if df.empty or len(df) < 10:
                return []

            # Find ministry name from the sheet
            ministry_name = None
            for idx in range(min(10, len(df))):
                for col in df.columns:
                    cell_value = df.iloc[idx][col]
                    if pd.notna(cell_value) and 'Ministry' in str(cell_value):
                        potential_name = self.clean_text(cell_value)
                        if len(potential_name) > 15 and 'Demand' in potential_name:
                            ministry_name = potential_name.split('Demand')[0].strip()
                            break
                if ministry_name:
                    break

            # Try to get from Sheet1 if not found
            if not ministry_name:
                ministry_name = self.find_ministry_from_sheet1(sheet_name)

            if not ministry_name:
                ministry_name = f"Ministry from {sheet_name}"

            logger.info(f"  Ministry: {ministry_name}")

            # Find header row (contains "Budget Estimates", "Actuals", etc.)
            header_row_idx = None
            for idx in range(min(15, len(df))):
                row_text = ' '.join([str(x) for x in df.iloc[idx] if pd.notna(x)])
                if 'Budget Estimates' in row_text or 'Actuals' in row_text:
                    header_row_idx = idx
                    break

            if header_row_idx is None:
                logger.warning(f"  Could not find header row in {sheet_name}")
                return []

            # Find column indices for different fiscal years
            # Look for "Budget Estimates 2026-2027", "Revised Estimates 2025-2026", etc.
            col_mapping = {}
            header_row = df.iloc[header_row_idx]
            next_row = df.iloc[header_row_idx + 1] if header_row_idx + 1 < len(df) else None

            for col_idx, cell in enumerate(header_row):
                cell_text = str(cell) if pd.notna(cell) else ""

                # Check for fiscal year indicators
                if '2024-2025' in cell_text or 'Actuals' in cell_text:
                    if 'Revenue' in cell_text or (next_row is not None and 'Revenue' in str(next_row[col_idx])):
                        col_mapping['actual_2024_revenue'] = col_idx
                    elif 'Total' in cell_text or (next_row is not None and 'Total' in str(next_row[col_idx])):
                        col_mapping['actual_2024_total'] = col_idx

                elif '2025-2026' in cell_text:
                    if 'Budget' in cell_text:
                        col_mapping['be_2025_total'] = col_idx + 2  # Usually Total is 2 columns after
                    elif 'Revised' in cell_text:
                        col_mapping['re_2025_total'] = col_idx + 2

                elif '2026-2027' in cell_text:
                    if 'Budget' in cell_text:
                        col_mapping['be_2026_total'] = col_idx + 2

            # Extract data rows (start after header + 1)
            data_rows = []
            start_row = header_row_idx + 2

            for idx in range(start_row, len(df)):
                row = df.iloc[idx]

                # Look for scheme/department name in columns 2-8
                scheme_name = None
                for col in range(2, min(9, len(row))):
                    cell = row[col]
                    if pd.notna(cell) and isinstance(cell, str):
                        cleaned = self.clean_text(cell)
                        if len(cleaned) > 5 and not cleaned.replace('.', '').replace(',', '').replace('-', '').isdigit():
                            # Skip header-like rows
                            if not any(x in cleaned.lower() for x in ['total', 'gross', 'recoveries', 'receipts', 'net', 'budget', 'actuals']):
                                scheme_name = cleaned
                                break

                if not scheme_name:
                    continue

                # Extract budget values
                budget_data = {
                    'sheet_name': sheet_name,
                    'ministry_name': ministry_name,
                    'scheme_name': scheme_name,
                    'row_index': idx
                }

                # Get values from identified columns
                if 'be_2026_total' in col_mapping:
                    val = self.extract_number(row[col_mapping['be_2026_total']])
                    if val:
                        budget_data['budget_estimate_2026'] = val

                if 're_2025_total' in col_mapping:
                    val = self.extract_number(row[col_mapping['re_2025_total']])
                    if val:
                        budget_data['revised_estimate_2025'] = val

                if 'be_2025_total' in col_mapping:
                    val = self.extract_number(row[col_mapping['be_2025_total']])
                    if val:
                        budget_data['budget_estimate_2025'] = val

                if 'actual_2024_total' in col_mapping:
                    val = self.extract_number(row[col_mapping['actual_2024_total']])
                    if val:
                        budget_data['actual_2024'] = val

                # Only add if we have at least one budget value
                if any(key in budget_data for key in ['budget_estimate_2026', 'revised_estimate_2025', 'budget_estimate_2025', 'actual_2024']):
                    data_rows.append(budget_data)

            logger.info(f"  Extracted {len(data_rows)} data rows")
            return data_rows

        except Exception as e:
            logger.error(f"Error parsing sheet {sheet_name}: {str(e)}")
            return []

    async def create_ministry(self, ministry_name: str) -> Ministry:
        """Create or get ministry"""
        if ministry_name in self.ministries:
            return self.ministries[ministry_name]

        ministry_code = f"MIN-{self.ministry_counter:04d}"
        self.ministry_counter += 1

        ministry = Ministry(
            ministry_code=ministry_code,
            ministry_name=ministry_name,
            ministry_short_name=ministry_name[:50],
            government_level="central",
            is_active=True,
            description="Imported from Union Budget 2026-27"
        )

        try:
            await ministry.insert()
            self.ministries[ministry_name] = ministry
            logger.info(f"Created ministry: {ministry_code} - {ministry_name[:50]}")
            return ministry
        except Exception as e:
            existing = await Ministry.find_one(Ministry.ministry_name == ministry_name)
            if existing:
                self.ministries[ministry_name] = existing
                return existing
            raise

    async def create_scheme(self, scheme_name: str, ministry_code: str, ministry_name: str) -> Scheme:
        """Create or get scheme"""
        scheme_key = f"{ministry_code}:{scheme_name}"
        if scheme_key in self.schemes:
            return self.schemes[scheme_key]

        scheme_code = f"SCH-{self.scheme_counter:05d}"
        self.scheme_counter += 1

        scheme = Scheme(
            scheme_code=scheme_code,
            scheme_name=scheme_name,
            scheme_short_name=scheme_name[:50],
            scheme_type="central_sector",
            scheme_status="active",
            ministry_id="temp-id",
            ministry_code=ministry_code,
            ministry_name=ministry_name,
            description="Imported from Union Budget"
        )

        try:
            await scheme.insert()
            self.schemes[scheme_key] = scheme
            logger.info(f"Created scheme: {scheme_code} - {scheme_name[:40]}")
            return scheme
        except Exception as e:
            existing = await Scheme.find_one(Scheme.scheme_name == scheme_name, Scheme.ministry_code == ministry_code)
            if existing:
                self.schemes[scheme_key] = existing
                return existing
            raise

    async def create_allocations(self, data: Dict, ministry: Ministry, scheme: Scheme):
        """Create budget allocations for different fiscal years"""

        # FY 2024-25 (Actuals)
        if 'actual_2024' in data:
            allocation_code = f"ALLOC-2024-25-{self.allocation_counter:06d}"
            self.allocation_counter += 1

            allocation = BudgetAllocation(
                allocation_code=allocation_code,
                fiscal_year="2024-25",
                allocation_status="actual",
                entity_type="scheme",
                entity_id=str(scheme.id),
                entity_code=scheme.scheme_code,
                entity_name=scheme.scheme_name,
                ministry_code=ministry.ministry_code,
                ministry_name=ministry.ministry_name,
                scheme_code=scheme.scheme_code,
                scheme_name=scheme.scheme_name,
                budget_type="revenue",
                budget_estimate=data['actual_2024'],
                actual_expenditure=data['actual_2024'],
                utilization_percentage=100.0,
                remarks=f"Actuals from {data['sheet_name']}"
            )

            try:
                await allocation.insert()
            except Exception as e:
                logger.debug(f"Could not insert allocation for 2024-25: {e}")

        # FY 2025-26 (Budget Estimate and Revised Estimate)
        if 'budget_estimate_2025' in data or 'revised_estimate_2025' in data:
            allocation_code = f"ALLOC-2025-26-{self.allocation_counter:06d}"
            self.allocation_counter += 1

            be_2025 = data.get('budget_estimate_2025', 0.0)
            re_2025 = data.get('revised_estimate_2025')

            allocation = BudgetAllocation(
                allocation_code=allocation_code,
                fiscal_year="2025-26",
                allocation_status="revised" if re_2025 else "allocated",
                entity_type="scheme",
                entity_id=str(scheme.id),
                entity_code=scheme.scheme_code,
                entity_name=scheme.scheme_name,
                ministry_code=ministry.ministry_code,
                ministry_name=ministry.ministry_name,
                scheme_code=scheme.scheme_code,
                scheme_name=scheme.scheme_name,
                budget_type="revenue",
                budget_estimate=be_2025 if be_2025 > 0 else None,
                revised_estimate=re_2025,
                previous_year_actual=data.get('actual_2024'),
                remarks=f"From {data['sheet_name']}"
            )

            try:
                await allocation.insert()
            except Exception as e:
                logger.debug(f"Could not insert allocation for 2025-26: {e}")

        # FY 2026-27 (Budget Estimate)
        if 'budget_estimate_2026' in data:
            allocation_code = f"ALLOC-2026-27-{self.allocation_counter:06d}"
            self.allocation_counter += 1

            allocation = BudgetAllocation(
                allocation_code=allocation_code,
                fiscal_year="2026-27",
                allocation_status="allocated",
                entity_type="scheme",
                entity_id=str(scheme.id),
                entity_code=scheme.scheme_code,
                entity_name=scheme.scheme_name,
                ministry_code=ministry.ministry_code,
                ministry_name=ministry.ministry_name,
                scheme_code=scheme.scheme_code,
                scheme_name=scheme.scheme_name,
                budget_type="revenue",
                budget_estimate=data['budget_estimate_2026'],
                previous_year_actual=data.get('actual_2024'),
                remarks=f"Budget 2026-27 from {data['sheet_name']}"
            )

            try:
                await allocation.insert()
            except Exception as e:
                logger.debug(f"Could not insert allocation for 2026-27: {e}")

    async def import_all_data(self):
        """Import all data"""
        logger.info("="*80)
        logger.info("STARTING BUDGET DATA IMPORT V2")
        logger.info("="*80)

        await connect_to_mongodb()

        all_extracted_data = []

        # Process all sheets except Sheet1
        for sheet_name in self.xl.sheet_names:
            if sheet_name.lower() == 'sheet1':
                continue

            sheet_data = self.parse_sheet(sheet_name)
            all_extracted_data.extend(sheet_data)

        logger.info(f"\nTotal data rows extracted: {len(all_extracted_data)}")

        # Group by ministry
        ministry_groups = {}
        for data in all_extracted_data:
            ministry_name = data['ministry_name']
            if ministry_name not in ministry_groups:
                ministry_groups[ministry_name] = []
            ministry_groups[ministry_name].append(data)

        logger.info(f"Found {len(ministry_groups)} unique ministries")

        # Create ministries, schemes, and allocations
        logger.info("\n" + "="*80)
        logger.info("CREATING DATABASE RECORDS")
        logger.info("="*80)

        for ministry_name, data_list in ministry_groups.items():
            try:
                ministry = await self.create_ministry(ministry_name)

                # Group by scheme
                scheme_groups = {}
                for data in data_list:
                    scheme_name = data['scheme_name']
                    if scheme_name not in scheme_groups:
                        scheme_groups[scheme_name] = []
                    scheme_groups[scheme_name].append(data)

                # Create schemes and allocations
                for scheme_name, scheme_data_list in scheme_groups.items():
                    try:
                        scheme = await self.create_scheme(scheme_name, ministry.ministry_code, ministry.ministry_name)

                        # Combine data from multiple rows for same scheme
                        combined_data = {
                            'sheet_name': scheme_data_list[0]['sheet_name'],
                            'ministry_name': ministry_name,
                            'scheme_name': scheme_name
                        }

                        for data in scheme_data_list:
                            for key in ['budget_estimate_2026', 'revised_estimate_2025', 'budget_estimate_2025', 'actual_2024']:
                                if key in data and key not in combined_data:
                                    combined_data[key] = data[key]

                        await self.create_allocations(combined_data, ministry, scheme)

                    except Exception as e:
                        logger.error(f"Error processing scheme {scheme_name[:40]}: {str(e)}")
                        continue

            except Exception as e:
                logger.error(f"Error processing ministry {ministry_name}: {str(e)}")
                continue

        # Summary
        logger.info("\n" + "="*80)
        logger.info("IMPORT SUMMARY")
        logger.info("="*80)
        logger.info(f"Ministries created: {len(self.ministries)}")
        logger.info(f"Schemes created: {len(self.schemes)}")
        logger.info(f"Allocations created: {self.allocation_counter - 1}")

        await close_mongodb_connection()

        logger.info("\n" + "="*80)
        logger.info("IMPORT COMPLETED SUCCESSFULLY!")
        logger.info("="*80)


async def main():
    """Main execution"""
    importer = BudgetDataImporterV2('allsbe.xlsx')
    await importer.import_all_data()


if __name__ == "__main__":
    asyncio.run(main())
