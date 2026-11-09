"""
Project 07: Movie Recommendation System
Item-based collaborative filtering using cosine similarity on user ratings.
Uses a synthetic ratings matrix — no download required.
"""

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


# Synthetic user-movie ratings (NaN = not rated)
RATINGS = {
    "Alice":   {"Inception": 5, "Titanic": 3, "Matrix": 5, "Frozen": 1, "Interstellar": 5},
    "Bob":     {"Inception": 4, "Titanic": 5, "Matrix": 4, "Frozen": 2, "Interstellar": 4},
    "Carol":   {"Inception": 5, "Titanic": 2, "Matrix": 5, "Frozen": 1, "Interstellar": 5},
    "Dave":    {"Inception": 3, "Titanic": 4, "Matrix": 3, "Frozen": 3, "Interstellar": 3},
    "Eve":     {"Inception": 1, "Titanic": 5, "Matrix": 2, "Frozen": 4},  # hasn't seen Interstellar
    "Frank":   {"Inception": 4, "Titanic": 3, "Matrix": 5, "Frozen": 1, "Interstellar": 4},
}


def recommend_for_user(ratings_df, user, top_n=2):
    """Recommend top-N movies the user hasn't rated yet."""
    user_ratings = ratings_df.loc[user]
    rated = user_ratings.dropna()
    unrated = user_ratings[user_ratings.isna()].index

    if len(unrated) == 0:
        return []

    # Item-item cosine similarity on the transposed matrix
    item_matrix = ratings_df.T.fillna(0)
    sim = cosine_similarity(item_matrix)
    sim_df = pd.DataFrame(sim, index=item_matrix.index, columns=item_matrix.index)

    scores = {}
    for movie in unrated:
        # Weighted average of similar items the user has rated
        similar = sim_df[movie][rated.index]
        weighted = (similar * rated).sum()
        norm = abs(similar).sum()
        scores[movie] = weighted / norm if norm > 0 else 0

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return ranked[:top_n]


def main():
    ratings_df = pd.DataFrame(RATINGS).T

    print("Movie Recommendation — Item-Based Collaborative Filtering")
    print("-" * 58)
    print("Ratings matrix:")
    print(ratings_df.fillna("-").to_string())
    print()

    target_user = "Eve"
    recommendations = recommend_for_user(ratings_df, target_user, top_n=2)

    print(f"Top recommendations for '{target_user}' (unrated movies):")
    for movie, score in recommendations:
        print(f"  • {movie:15s}  predicted score: {score:.2f}")

    # Show item similarity for context
    item_matrix = ratings_df.T.fillna(0)
    sim = cosine_similarity(item_matrix)
    sim_df = pd.DataFrame(sim, index=item_matrix.index, columns=item_matrix.index)
    print("\nItem similarity (Inception vs. others):")
    for movie, val in sim_df["Inception"].items():
        if movie != "Inception":
            print(f"  Inception ↔ {movie:10s}: {val:.3f}")


if __name__ == "__main__":
    main()
