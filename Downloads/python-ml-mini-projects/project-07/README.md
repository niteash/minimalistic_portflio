## Movie Recommendation System

### Problem Statement
Recommend movies to a user based on ratings from similar users, using item-based collaborative filtering.

### Dataset
- **Source:** Synthetic 6-user × 5-movie ratings matrix (embedded in code)
- **Scale:** 1–5 stars; missing values = not yet rated

### Approach
1. Build a user-movie ratings DataFrame
2. Compute item-item cosine similarity
3. For a target user, score unrated movies as weighted averages of similar rated items
4. Return top-N recommendations

### Result
For user **Eve** (likes Titanic/Frozen, dislikes sci-fi), the system recommends movies aligned with her taste profile. Inception and Matrix typically score highest similarity with each other.

### How to Run
```bash
cd project-07
pip install -r requirements.txt
python main.py
```
