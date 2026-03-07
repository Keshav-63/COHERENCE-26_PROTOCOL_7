import json
import random
from datetime import datetime, timedelta

# -----------------------------
# MINISTRIES
# -----------------------------
MINISTRIES = [
    {"ministry_id": "MIN-01", "ministry_name": "Ministry of Health"},
    {"ministry_id": "MIN-02", "ministry_name": "Ministry of Transport"},
    {"ministry_id": "MIN-03", "ministry_name": "Ministry of Education"}
]

# -----------------------------
# STATES & DISTRICTS
# -----------------------------
STATES = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"]
}

# -----------------------------
# VENDORS
# -----------------------------
VENDORS_DATA = [
    ("Patil Civil Works", "Civil Contractor"),
    ("Deshmukh Logistics", "Transport & Logistics"),
    ("Sharma Medical Supplies", "Medical Supplier"),
    ("Kulkarni IT Solutions", "IT Services"),
    ("Shinde Stationers", "Education & Stationery")
]

# -----------------------------
# ITEMS
# -----------------------------
PROFESSION_CATALOG = {
    "Civil Contractor": [
        ("Portland Cement (50kg)", 400),
        ("TMT Steel Bar (ton)", 55000)
    ],
    "Medical Supplier": [
        ("ICU Motorized Bed", 85000),
        ("N95 Masks (box of 50)", 1500)
    ],
    "IT Services": [
        ("Office Laptop (Core i5)", 45000),
        ("Server Rack (42U)", 25000)
    ],
    "Transport & Logistics": [
        ("Diesel Fuel (liter)", 95),
        ("Heavy Bus Tyre", 16000)
    ],
    "Education & Stationery": [
        ("Student Dual Desk", 3500),
        ("A4 Paper (10 Reams)", 2200)
    ]
}


# -----------------------------
# GENERATOR
# -----------------------------
def generate_demo_data():

    print("Generating realistic Maharashtra government budget dataset...")

    departments = []
    vendors = []
    transactions = []

    dept_totals = {}
    vendor_totals = {}

    # -----------------------------
    # CREATE VENDORS
    # -----------------------------
    for i, v in enumerate(VENDORS_DATA):

        vendor_id = f"VND-{i+1:02d}"

        vendors.append({
            "vendor_id": vendor_id,
            "vendor_name": v[0],
            "profession": v[1],
            "risk_rating": "LOW",
            "registration_date": "2020-04-12"
        })

        vendor_totals[vendor_id] = {"used": 0, "projects": 0}

    # -----------------------------
    # CREATE DEPARTMENTS
    # -----------------------------
    dept_id = 1

    for ministry in MINISTRIES:
        for state, districts in STATES.items():

            for district in districts:

                allocated = random.uniform(5_00_00_000, 20_00_00_000)
                utilized = allocated * random.uniform(0.4, 0.95)

                case = random.choice(["surplus", "balanced", "deficit"])

                if case == "surplus":
                    required = allocated * random.uniform(0.6, 0.9)

                elif case == "balanced":
                    required = allocated * random.uniform(0.9, 1.05)

                else:
                    required = allocated * random.uniform(1.05, 1.3)

                dept = {
                    "dept_id": f"DPT-{dept_id:03d}",
                    "dept_name": f"{district} {ministry['ministry_name'].split()[-1]} Dept",
                    "ministry": ministry["ministry_name"],
                    "state": state,
                    "district": district,
                    "allocated_budget": round(allocated, 2),
                    "utilized_budget": round(utilized, 2),
                    "required_budget": round(required, 2)
                }

                departments.append(dept)

                dept_totals[dept["dept_id"]] = 0

                dept_id += 1

    # -----------------------------
    # CREATE TRANSACTIONS
    # -----------------------------
    for i in range(1, 1000): # Increased transactions for ML stability

        dept = random.choice(departments)
        vendor = random.choice(vendors)

        item_name, base_price = random.choice(
            PROFESSION_CATALOG[vendor["profession"]]
        )

        quantity = random.randint(10, 100)

        unit_price = base_price * random.uniform(0.9, 1.15)

        amount = quantity * unit_price

        timestamp = datetime(2025, 4, 1) + timedelta(days=random.randint(0, 330))

        # Inject anomalies
        if i == 20:
            amount = base_price * quantity * 3.5

        if i == 40:
            amount = 900000

        transactions.append({
            "trans_id": f"TX-{i:03d}",
            "dept_id": dept["dept_id"],
            "dept_name": dept["dept_name"],
            "vendor_id": vendor["vendor_id"],
            "vendor_name": vendor["vendor_name"],
            "item_name": item_name,
            "quantity": quantity,
            "amount": round(amount, 2),
            "latitude": round(random.uniform(18, 20), 2),  # roughly Maharashtra lat
            "longitude": round(random.uniform(72, 80), 2), # roughly Maharashtra lon
            "timestamp": timestamp.isoformat() + "Z"
        })

        dept_totals[dept["dept_id"]] += amount
        vendor_totals[vendor["vendor_id"]]["used"] += amount
        vendor_totals[vendor["vendor_id"]]["projects"] += 1

    # -----------------------------
    # FINALIZE DEPARTMENTS
    # -----------------------------
    for dept in departments:

        used = dept_totals[dept["dept_id"]]

        dept["utilized_budget"] = round(used, 2)
        
        # Add random features for ML
        dept["historical_utilization_pct"] = random.uniform(0.4, 0.95)
        dept["project_delays"] = random.randint(0, 10)

    # -----------------------------
    # FINALIZE VENDORS
    # -----------------------------
    final_vendors = []

    for v in vendors:

        used = vendor_totals[v["vendor_id"]]["used"]

        v["no_of_ongoing_projects"] = vendor_totals[v["vendor_id"]]["projects"]

        v["budget_used"] = round(used, 2)

        v["budget_alloted"] = round(used * 1.5 + 500000, 2)

        final_vendors.append(v)

    # -----------------------------
    # SAVE FILES
    # -----------------------------
    with open("departments.json", "w") as f:
        json.dump(departments, f, indent=4)

    with open("vendors.json", "w") as f:
        json.dump(final_vendors, f, indent=4)

    with open("transactions.json", "w") as f:
        json.dump(transactions, f, indent=4)

    print("\nDATASET GENERATED SUCCESSFULLY\n")
    print("Ministries:", len(MINISTRIES))
    print("Departments:", len(departments))
    print("Transactions:", len(transactions))

if __name__ == "__main__":
    generate_demo_data()
