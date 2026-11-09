"""
Project 10: Exploratory Data Analysis (EDA)
Full EDA workflow on the Titanic survival dataset.
"""

from pathlib import Path

import pandas as pd
import seaborn as sns

CACHE_DIR = Path(__file__).parent / ".seaborn_cache"


def main():
    # Built-in dataset via seaborn (cached locally in project folder)
    CACHE_DIR.mkdir(exist_ok=True)
    df = sns.load_dataset("titanic", data_home=str(CACHE_DIR))

    print("Titanic Dataset — Exploratory Data Analysis")
    print("=" * 45)

    # --- 1. Shape and dtypes ---
    print(f"\n1. OVERVIEW")
    print(f"   Rows: {len(df):,}  |  Columns: {len(df.columns)}")
    print(f"   Columns: {', '.join(df.columns)}")

    # --- 2. Missing values ---
    missing = df.isnull().sum()
    missing_pct = (missing / len(df) * 100).round(1)
    print(f"\n2. MISSING VALUES")
    for col in df.columns:
        if missing[col] > 0:
            print(f"   {col:15s}: {missing[col]:4d} ({missing_pct[col]:.1f}%)")

    # --- 3. Survival rate overall and by key groups ---
    print(f"\n3. SURVIVAL RATES")
    overall = df["survived"].mean()
    print(f"   Overall survival: {overall:.1%}")

    for col in ["sex", "class", "embark_town"]:
        rates = df.groupby(col)["survived"].mean().sort_values(ascending=False)
        print(f"\n   By {col}:")
        for category, rate in rates.items():
            print(f"     {str(category):12s}: {rate:.1%}")

    # --- 4. Numeric summaries ---
    print(f"\n4. NUMERIC SUMMARY (age, fare)")
    print(df[["age", "fare"]].describe().round(2).to_string())

    # --- 5. Key insights ---
    female_survival = df[df["sex"] == "female"]["survived"].mean()
    male_survival = df[df["sex"] == "male"]["survived"].mean()
    first_class = df[df["class"] == "First"]["survived"].mean()
    third_class = df[df["class"] == "Third"]["survived"].mean()

    print(f"\n5. KEY INSIGHTS")
    print(f"   • Women survived at {female_survival:.0%} vs. men at {male_survival:.0%}")
    print(f"   • First class: {first_class:.0%} survival vs. Third class: {third_class:.0%}")
    print(f"   • Age missing for {missing_pct['age']:.0f}% of passengers")
    median_fare_survived = df[df["survived"] == 1]["fare"].median()
    median_fare_died = df[df["survived"] == 0]["fare"].median()
    print(f"   • Median fare (survived): ${median_fare_survived:.2f} vs. (died): ${median_fare_died:.2f}")


if __name__ == "__main__":
    main()
