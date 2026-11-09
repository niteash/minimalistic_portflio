## California Housing Price Prediction

### Problem Statement
Predict the median house value in California districts using demographic and geographic features.

### Dataset
- **Source:** scikit-learn built-in `fetch_california_housing`
- **Samples:** 20,640 districts
- **Target:** Median house value (in $100,000s)

### Approach
1. Load the dataset with pandas-friendly frames
2. Split 80/20 into train and test sets
3. Fit `LinearRegression` from scikit-learn
4. Report RMSE and R² on the test set

### Result
Typical test performance: **R² ≈ 0.60**, **RMSE ≈ 0.74** (in $100k units). Linear regression captures broad trends but misses non-linear effects.

### How to Run
```bash
cd project-01
pip install -r requirements.txt
python main.py
```
