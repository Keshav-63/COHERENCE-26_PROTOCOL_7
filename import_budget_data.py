"""
Comprehensive Budget Data Import Script
Extracts ALL data from allsbe.xlsx and loads into MongoDB
"""

import pandas as pd
import numpy as np
import asyncio
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.budget.models import (
    Ministry, Department, Scheme, BudgetAllocation
)

class BudgetDataImporter:
    """Imports budget data from Excel to MongoDB"""

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
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove newlines
        text = text.replace('\n', ' ').replace('\r', ' ')
        return text

    def extract_number(self, value) -> Optional[float]:
        """Extract numerical value from cell"""
        if pd.isna(value) or value is None or value == '':
            return None

        # If already a number
        if isinstance(value, (int, float)):
            return float(value)

        # Convert to string and clean
        value_str = str(value).strip()

        # Remove common text patterns
        value_str = value_str.replace('...', '').replace('-', '0')
        value_str = value_str.replace(',', '')  # Remove thousand separators

        # Try to extract number
        try:
            # Find first number (including decimals)
            match = re.search(r'-?\d+\.?\d*', value_str)
            if match:
                return float(match.group())
        except:
            pass

        return None

    def find_ministry_name(self, df: pd.DataFrame) -> Optional[str]:
        """
        Find ministry name in the sheet
        Usually appears in early rows
        """
        for i in range(min(20, len(df))):
            for col in df.columns:
                cell_value = df.iloc[i][col]
                if pd.notna(cell_value):
                    text = str(cell_value).lower()
                    # Check if it's a ministry name
                    if 'ministry' in text or 'department' in text:
                        ministry_name = self.clean_text(cell_value)
                        if len(ministry_name) > 10:  # Valid ministry names are longer
                            return ministry_name
        return None

    def extract_budget_values(self, row: pd.Series) -> Dict[str, Optional[float]]:
        """
        Extract budget values from a row
        Returns dict with BE, RE, Actual, etc.
        """
        values = {}

        for col_name, cell_value in row.items():
            num_value = self.extract_number(cell_value)
            if num_value is not None:
                col_str = str(col_name).lower()

                # Identify column type
                if 'budget' in col_str or 'b.e' in col_str or 'be ' in col_str:
                    values['budget_estimate'] = num_value
                elif 'revised' in col_str or 'r.e' in col_str or 're ' in col_str:
                    values['revised_estimate'] = num_value
                elif 'actual' in col_str or 'actuals' in col_str:
                    values['actual_expenditure'] = num_value
                elif 'previous' in col_str or 'prev' in col_str:
                    values['previous_year_actual'] = num_value
                elif 'total' in col_str:
                    if 'budget_estimate' not in values:
                        values['budget_estimate'] = num_value

        return values

    def parse_sheet(self, sheet_name: str) -> List[Dict]:
        """Parse a single sheet and extract budget data"""
        logger.info(f"Parsing sheet: {sheet_name}")

        try:
            # Read sheet without headers first
            df_raw = pd.read_excel(self.excel_file, sheet_name=sheet_name, header=None)

            if df_raw.empty or len(df_raw) < 2:
                logger.warning(f"Sheet {sheet_name} is empty or too small")
                return []

            # Find ministry name
            ministry_name = self.find_ministry_name(df_raw)
            if not ministry_name:
                ministry_name = f"Ministry/Department from {sheet_name}"

            logger.info(f"  Ministry: {ministry_name}")

            # Extract all rows with numerical data
            extracted_data = []

            for idx, row in df_raw.iterrows():
                # Check if row has any numerical values
                has_numbers = False
                for cell in row:
                    if self.extract_number(cell) is not None:
                        has_numbers = True
                        break

                if has_numbers:
                    # Extract values
                    budget_values = self.extract_budget_values(row)

                    if budget_values:
                        # Find scheme/program name in the same row
                        scheme_name = None
                        for cell in row:
                            if pd.notna(cell) and isinstance(cell, str):
                                cleaned = self.clean_text(cell)
                                if len(cleaned) > 5 and not cleaned.replace('.', '').replace(',', '').isdigit():
                                    scheme_name = cleaned
                                    break

                        if not scheme_name:
                            scheme_name = f"Program/Scheme from row {idx}"

                        extracted_data.append({
                            'sheet_name': sheet_name,
                            'ministry_name': ministry_name,
                            'scheme_name': scheme_name,
                            'row_index': idx,
                            **budget_values
                        })

            logger.info(f"  Extracted {len(extracted_data)} data rows")
            return extracted_data

        except Exception as e:
            logger.error(f"Error parsing sheet {sheet_name}: {str(e)}")
            return []

    async def create_ministry(self, ministry_name: str, government_level: str = "central") -> Ministry:
        """Create or get ministry"""

        # Check if already exists
        if ministry_name in self.ministries:
            return self.ministries[ministry_name]

        # Generate code
        ministry_code = f"MIN-{self.ministry_counter:04d}"
        self.ministry_counter += 1

        # Create short name
        ministry_short_name = ministry_name[:50]

        ministry = Ministry(
            ministry_code=ministry_code,
            ministry_name=ministry_name,
            ministry_short_name=ministry_short_name,
            government_level=government_level,
            is_active=True,
            description=f"Extracted from budget data"
        )

        try:
            await ministry.insert()
            self.ministries[ministry_name] = ministry
            logger.info(f"Created ministry: {ministry_code} - {ministry_name}")
            return ministry
        except Exception as e:
            logger.error(f"Error creating ministry {ministry_name}: {str(e)}")
            # Try to find existing
            existing = await Ministry.find_one(Ministry.ministry_name == ministry_name)
            if existing:
                self.ministries[ministry_name] = existing
                return existing
            raise

    async def create_scheme(self, scheme_name: str, ministry_code: str, ministry_name: str) -> Scheme:
        """Create or get scheme"""

        # Check if already exists
        scheme_key = f"{ministry_code}:{scheme_name}"
        if scheme_key in self.schemes:
            return self.schemes[scheme_key]

        # Generate code
        scheme_code = f"SCH-{self.scheme_counter:05d}"
        self.scheme_counter += 1

        scheme = Scheme(
            scheme_code=scheme_code,
            scheme_name=scheme_name,
            scheme_short_name=scheme_name[:50],
            scheme_type="central_sector",
            scheme_status="active",
            ministry_id="temp-id",  # Will be updated after ministry is saved
            ministry_code=ministry_code,
            ministry_name=ministry_name,
            description=f"Extracted from budget data"
        )

        try:
            await scheme.insert()
            self.schemes[scheme_key] = scheme
            logger.info(f"Created scheme: {scheme_code} - {scheme_name[:50]}")
            return scheme
        except Exception as e:
            logger.error(f"Error creating scheme {scheme_name[:50]}: {str(e)}")
            # Try to find existing
            existing = await Scheme.find_one(Scheme.scheme_name == scheme_name, Scheme.ministry_code == ministry_code)
            if existing:
                self.schemes[scheme_key] = existing
                return existing
            raise

    async def create_allocation(self, data: Dict, ministry: Ministry, scheme: Scheme, fiscal_year: str = "2024-25"):
        """Create budget allocation"""

        allocation_code = f"ALLOC-{fiscal_year}-{self.allocation_counter:06d}"
        self.allocation_counter += 1

        # Extract budget values
        budget_estimate = data.get('budget_estimate', 0.0)
        revised_estimate = data.get('revised_estimate')
        actual_expenditure = data.get('actual_expenditure')
        previous_year_actual = data.get('previous_year_actual')

        # Calculate utilization if actual is available
        utilization_percentage = None
        if actual_expenditure and budget_estimate and budget_estimate > 0:
            utilization_percentage = (actual_expenditure / budget_estimate) * 100

        allocation = BudgetAllocation(
            allocation_code=allocation_code,
            fiscal_year=fiscal_year,
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
            budget_estimate=budget_estimate or 0.0,
            revised_estimate=revised_estimate,
            actual_expenditure=actual_expenditure,
            previous_year_actual=previous_year_actual,
            utilization_percentage=utilization_percentage,
            remarks=f"Imported from {data.get('sheet_name', 'unknown sheet')}, row {data.get('row_index', 0)}"
        )

        try:
            await allocation.insert()
            logger.info(f"Created allocation: {allocation_code} - BE: {budget_estimate:.2f} Cr")
        except Exception as e:
            logger.error(f"Error creating allocation: {str(e)}")

    async def import_all_data(self):
        """Import all data from Excel to MongoDB"""
        logger.info("="*80)
        logger.info("STARTING BUDGET DATA IMPORT")
        logger.info("="*80)

        # Connect to MongoDB
        await connect_to_mongodb()

        all_extracted_data = []

        # Process all sheets
        for sheet_name in self.xl.sheet_names:
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

        # Create ministries and allocations
        logger.info("\n" + "="*80)
        logger.info("CREATING DATABASE RECORDS")
        logger.info("="*80)

        for ministry_name, data_list in ministry_groups.items():
            try:
                # Create ministry
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

                        # Create allocation (combine all data for this scheme)
                        # Use the row with highest budget estimate
                        best_data = max(scheme_data_list, key=lambda x: x.get('budget_estimate', 0))

                        await self.create_allocation(best_data, ministry, scheme)

                    except Exception as e:
                        logger.error(f"Error processing scheme {scheme_name[:50]}: {str(e)}")
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

        # Close connection
        await close_mongodb_connection()

        logger.info("\n" + "="*80)
        logger.info("IMPORT COMPLETED SUCCESSFULLY!")
        logger.info("="*80)


async def main():
    """Main execution"""
    importer = BudgetDataImporter('allsbe.xlsx')
    await importer.import_all_data()


if __name__ == "__main__":
    asyncio.run(main())
