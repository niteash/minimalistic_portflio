## Sales CSV Report Automation

### Problem Statement
Automate a small data pipeline: generate regional sales CSVs, merge them, and produce a summary report — no manual spreadsheet work.

### Dataset
- **Source:** Embedded sample sales data for 3 regions (north, south, east)
- **Columns:** product, quantity, unit_price

### Approach
1. Write one CSV per region into `data/`
2. Merge all CSVs into `data/sales_merged.csv` with a computed revenue column
3. Generate `sales_report.txt` with total revenue, per-region breakdown, and top product

### Result
Pipeline produces **3 regional CSVs**, **1 merged file**, and **1 text report**. Total revenue is computed automatically across all regions.

### How to Run
```bash
cd project-09
python main.py
```

No pip install needed — uses Python standard library only.
