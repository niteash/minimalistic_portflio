## Product Review Sentiment Classification

### Problem Statement
Automatically classify short product reviews as **positive** or **negative** using classic NLP techniques.

### Dataset
- **Source:** Embedded dataset of 40 labeled reviews (no download required)
- **Labels:** positive / negative

### Approach
1. Convert reviews to TF-IDF vectors with English stop-word removal
2. 5-fold cross-validation for reliable accuracy on small data
3. Fit `LogisticRegression` on the full set for demo predictions

### Result
5-fold CV accuracy is typically **0.85–1.00** on this balanced set. Demo predictions classify new phrases correctly.

### How to Run
```bash
cd project-04
pip install -r requirements.txt
python main.py
```
