## Breast Cancer Tumor Classification

### Problem Statement
Classify breast tumor biopsies as **malignant** or **benign** based on cell measurements.

### Dataset
- **Source:** scikit-learn `load_breast_cancer` (Wisconsin Diagnostic Dataset)
- **Samples:** 569 tumors, 30 numeric features
- **Classes:** malignant (0), benign (1)

### Approach
1. Stratified train/test split (80/20)
2. Train a `RandomForestClassifier` with 100 trees
3. Evaluate with accuracy and per-class precision/recall
4. Rank features by importance

### Result
Typical test **accuracy ≈ 0.96–0.98**. Worst radius and concave points are usually among the top predictors.

### How to Run
```bash
cd project-02
pip install -r requirements.txt
python main.py
```
