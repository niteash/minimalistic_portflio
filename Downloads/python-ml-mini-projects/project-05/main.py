"""
Project 05: Data Visualization with Seaborn
Create a multi-panel chart gallery exploring the Palmer Penguins dataset.
"""

from pathlib import Path

import matplotlib.pyplot as plt
import seaborn as sns

CACHE_DIR = Path(__file__).parent / ".seaborn_cache"


def main():
    # Built-in dataset via seaborn (cached locally in project folder)
    CACHE_DIR.mkdir(exist_ok=True)
    penguins = sns.load_dataset("penguins", data_home=str(CACHE_DIR)).dropna()

    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)

    sns.set_theme(style="whitegrid", palette="muted")

    # --- Figure 1: Distribution of body mass by species ---
    fig1, ax1 = plt.subplots(figsize=(8, 5))
    sns.boxplot(data=penguins, x="species", y="body_mass_g", ax=ax1)
    ax1.set_title("Body Mass Distribution by Species")
    ax1.set_ylabel("Body Mass (g)")
    fig1.tight_layout()
    fig1.savefig(output_dir / "01_body_mass_by_species.png", dpi=120)
    plt.close(fig1)

    # --- Figure 2: Scatter — flipper length vs. bill length ---
    fig2, ax2 = plt.subplots(figsize=(8, 5))
    sns.scatterplot(
        data=penguins,
        x="flipper_length_mm",
        y="bill_length_mm",
        hue="species",
        style="sex",
        s=80,
        ax=ax2,
    )
    ax2.set_title("Flipper Length vs. Bill Length")
    fig2.tight_layout()
    fig2.savefig(output_dir / "02_flipper_vs_bill.png", dpi=120)
    plt.close(fig2)

    # --- Figure 3: Correlation heatmap ---
    numeric = penguins.select_dtypes("number")
    corr = numeric.corr()
    fig3, ax3 = plt.subplots(figsize=(7, 5))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", ax=ax3)
    ax3.set_title("Feature Correlation Heatmap")
    fig3.tight_layout()
    fig3.savefig(output_dir / "03_correlation_heatmap.png", dpi=120)
    plt.close(fig3)

    # Print summary stats to console
    print("Palmer Penguins — Data Visualization")
    print("-" * 38)
    print(f"Rows            : {len(penguins)}")
    print(f"Species counts  :\n{penguins['species'].value_counts().to_string()}")
    print(f"\nSaved 3 charts to ./{output_dir}/")
    for f in sorted(output_dir.glob("*.png")):
        print(f"  • {f.name}")


if __name__ == "__main__":
    main()
