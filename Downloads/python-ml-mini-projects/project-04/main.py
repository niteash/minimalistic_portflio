"""
Project 04: NLP Text Classification
Classify short product reviews as positive or negative using TF-IDF + Logistic Regression.
Uses an embedded mini-dataset so no download is required.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import cross_val_score

# Embedded review dataset — balanced, no external download needed
REVIEWS = [
    # --- positive ---
    ("Great product, works perfectly!", "positive"),
    ("Love it, highly recommend", "positive"),
    ("Excellent value for the price", "positive"),
    ("Amazing features, easy to use", "positive"),
    ("Best purchase I have made this year", "positive"),
    ("Good enough for everyday use", "positive"),
    ("Fast shipping and great packaging", "positive"),
    ("Perfect gift, they loved it", "positive"),
    ("Solid performance, no complaints", "positive"),
    ("Would purchase again without hesitation", "positive"),
    ("Simple setup, works right out of the box", "positive"),
    ("Stylish design and reliable", "positive"),
    ("Very happy with this purchase", "positive"),
    ("Exceeded my expectations completely", "positive"),
    ("Quality build and smooth operation", "positive"),
    ("Five stars, absolutely worth it", "positive"),
    ("Great customer experience overall", "positive"),
    ("Impressive quality for the price", "positive"),
    ("Works great and looks beautiful", "positive"),
    ("Highly satisfied, no regrets", "positive"),
    # --- negative ---
    ("Terrible quality, broke after one day", "negative"),
    ("Waste of money, very disappointed", "negative"),
    ("Poor build quality and bad support", "negative"),
    ("Does not work as advertised", "negative"),
    ("Returned it immediately, awful", "negative"),
    ("Cheap materials, feels flimsy", "negative"),
    ("Stopped working within a week", "negative"),
    ("Misleading description, not happy", "negative"),
    ("Customer service was unhelpful", "negative"),
    ("Overpriced for what you get", "negative"),
    ("Battery drains too quickly", "negative"),
    ("Arrived damaged and unusable", "negative"),
    ("Complete waste of time and money", "negative"),
    ("Very poor quality, do not recommend", "negative"),
    ("Broke easily, terrible experience", "negative"),
    ("Not worth the price at all", "negative"),
    ("Disappointed with the performance", "negative"),
    ("Faulty unit, had to return it", "negative"),
    ("Bad design and unreliable", "negative"),
    ("Regret buying this product", "negative"),
    ("Complete garbage, do not buy this", "negative"),
    ("Do not buy, total garbage product", "negative"),
    ("Absolutely terrible, never buy again", "negative"),
]


def main():
    texts = [r[0] for r in REVIEWS]
    labels = [r[1] for r in REVIEWS]

    # TF-IDF with unigrams + bigrams captures phrases like "do not"
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    X = vectorizer.fit_transform(texts)

    # Logistic regression works well on sparse TF-IDF features
    model = LogisticRegression(max_iter=1000, random_state=42)
    cv_scores = cross_val_score(model, X, labels, cv=5)

    # Train on full dataset for demo predictions
    model.fit(X, labels)
    train_accuracy = accuracy_score(labels, model.predict(X))

    print("Product Review Sentiment — TF-IDF + Logistic Regression")
    print("-" * 48)
    print(f"Total samples   : {len(texts)}")
    print(f"Vocabulary size : {len(vectorizer.vocabulary_)}")
    print(f"5-Fold CV Acc   : {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")
    print(f"Train Accuracy  : {train_accuracy:.3f}")

    # Demo predictions on new unseen phrases
    demo_texts = [
        "Absolutely fantastic, five stars!",
        "Complete garbage, do not buy",
        "Decent product, nothing special",
    ]
    demo_X = vectorizer.transform(demo_texts)
    demo_preds = model.predict(demo_X)
    print("\nDemo Predictions:")
    for text, pred in zip(demo_texts, demo_preds):
        print(f'  "{text}" → {pred}')


if __name__ == "__main__":
    main()
