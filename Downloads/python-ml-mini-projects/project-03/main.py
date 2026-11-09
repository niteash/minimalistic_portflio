"""
Project 03: K-Means Clustering on Iris
Group iris flowers into clusters and compare with true species labels.
"""

from sklearn.cluster import KMeans
from sklearn.datasets import load_iris
from sklearn.metrics import adjusted_rand_score, silhouette_score
from sklearn.preprocessing import StandardScaler


def main():
    data = load_iris(as_frame=True)
    X = data.data
    y_true = data.target

    # Scale features so petal/sepal dimensions are comparable
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Fit K-Means with k=3 (known number of species)
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)

    # Cluster quality metrics
    silhouette = silhouette_score(X_scaled, labels)
    ari = adjusted_rand_score(y_true, labels)

    print("Iris Clustering — K-Means (k=3)")
    print("-" * 35)
    print(f"Silhouette Score     : {silhouette:.3f}  (higher = better separation)")
    print(f"Adjusted Rand Index  : {ari:.3f}  (1.0 = perfect match with true labels)")
    print("\nCluster centers (scaled features):")
    feature_names = data.feature_names
    for i, center in enumerate(kmeans.cluster_centers_):
        print(f"  Cluster {i}: ", end="")
        print(", ".join(f"{name}={val:.2f}" for name, val in zip(feature_names, center)))

    # Cross-tab: how clusters map to species
    import pandas as pd

    crosstab = pd.crosstab(labels, y_true, rownames=["Cluster"], colnames=["Species"])
    crosstab.columns = data.target_names
    print("\nCluster vs. True Species:")
    print(crosstab)


if __name__ == "__main__":
    main()
