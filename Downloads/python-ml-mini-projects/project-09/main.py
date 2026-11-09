"""
Project 09: CSV Report Automation
Generate sample sales CSVs, merge them, and produce a summary report automatically.
"""

import csv
from datetime import datetime
from pathlib import Path

# Sample sales data per region (embedded — no download)
SALES_DATA = {
    "north": [
        ("Laptop", 3, 999.99),
        ("Mouse", 12, 29.99),
        ("Keyboard", 8, 79.99),
    ],
    "south": [
        ("Monitor", 5, 349.99),
        ("Headphones", 10, 59.99),
        ("Webcam", 6, 89.99),
    ],
    "east": [
        ("Tablet", 4, 449.99),
        ("Stylus", 15, 39.99),
        ("Case", 20, 24.99),
    ],
}


def write_region_csv(region, rows, directory):
    """Write one region's sales file."""
    path = directory / f"sales_{region}.csv"
    with path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["product", "quantity", "unit_price"])
        writer.writerows(rows)
    return path


def merge_csvs(csv_files, output_path):
    """Merge multiple CSVs, adding a region column."""
    merged = []
    for path in csv_files:
        region = path.stem.replace("sales_", "")
        with path.open() as f:
            reader = csv.DictReader(f)
            for row in reader:
                qty = int(row["quantity"])
                price = float(row["unit_price"])
                merged.append({
                    "region": region,
                    "product": row["product"],
                    "quantity": qty,
                    "unit_price": price,
                    "revenue": round(qty * price, 2),
                })
    with output_path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["region", "product", "quantity", "unit_price", "revenue"])
        writer.writeheader()
        writer.writerows(merged)
    return merged


def generate_report(rows, report_path):
    """Write a human-readable summary report."""
    total_revenue = sum(r["revenue"] for r in rows)
    by_region = {}
    for r in rows:
        by_region.setdefault(r["region"], 0)
        by_region[r["region"]] += r["revenue"]

    top_product = max(rows, key=lambda r: r["revenue"])

    lines = [
        "SALES SUMMARY REPORT",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "=" * 40,
        f"Total Revenue    : ${total_revenue:,.2f}",
        f"Total Line Items : {len(rows)}",
        "",
        "Revenue by Region:",
    ]
    for region, rev in sorted(by_region.items()):
        lines.append(f"  {region:8s}: ${rev:,.2f}")
    lines += [
        "",
        f"Top Product: {top_product['product']} ({top_product['region']}) — ${top_product['revenue']:,.2f}",
    ]

    report_path.write_text("\n".join(lines) + "\n")
    return lines


def main():
    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)

    # Step 1: Write per-region CSV files
    csv_files = [write_region_csv(region, rows, data_dir) for region, rows in SALES_DATA.items()]
    print(f"Created {len(csv_files)} regional CSV files in ./{data_dir}/")

    # Step 2: Merge into one master file
    merged_path = data_dir / "sales_merged.csv"
    rows = merge_csvs(csv_files, merged_path)
    print(f"Merged → {merged_path} ({len(rows)} rows)")

    # Step 3: Generate summary report
    report_path = Path("sales_report.txt")
    report_lines = generate_report(rows, report_path)

    print(f"\nCSV Report Automation")
    print("-" * 30)
    for line in report_lines:
        print(line)
    print(f"\nReport saved to ./{report_path}")


if __name__ == "__main__":
    main()
