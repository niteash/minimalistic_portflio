## Iris Flower Clustering

### Problem Statement
Discover natural groupings among iris flowers using unsupervised K-Means clustering, then compare clusters to the known species labels.

### Dataset
- **Source:** scikit-learn `load_iris`
- **Samples:** 150 flowers, 4 features (sepal/petal length & width)
- **True labels:** setosa, versicolor, virginica (used for evaluation only)

### Approach
1. Standardize features with `StandardScaler`
2. Apply K-Means with k=3
3. Measure cluster quality with silhouette score and adjusted Rand index
4. Cross-tabulate clusters against true species

### Result
K-Means typically achieves **ARI ≈ 0.73–0.80** and **silhouette ≈ 0.45–0.55**, with setosa forming a clean separate cluster.

### How to Run
```bash
cd project-03
pip install -r requirements.txt
python main.py
```
