## Palmer Penguins Visualization Gallery

### Problem Statement
Explore relationships in the Palmer Penguins dataset through three informative charts: box plot, scatter plot, and correlation heatmap.

### Dataset
- **Source:** seaborn built-in `load_dataset("penguins")`
- **Samples:** ~344 penguins after dropping missing values
- **Features:** species, island, bill/flipper measurements, body mass, sex

### Approach
1. Load and clean the penguins dataset
2. Create box plot of body mass by species
3. Create scatter plot of flipper vs. bill length (colored by species)
4. Build a numeric correlation heatmap
5. Save all charts to `output/`

### Result
Three PNG files saved locally. Console prints species counts and file paths. Charts reveal clear species separation by flipper length and body mass.

### How to Run
```bash
cd project-05
pip install -r requirements.txt
python main.py
```

Open the generated images in `output/` to view the charts.
