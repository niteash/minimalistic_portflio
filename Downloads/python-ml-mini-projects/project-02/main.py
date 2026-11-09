"""
Project 02: Breast Cancer Classification
Classify tumors as malignant or benign using Random Forest.
"""

from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split


def main():
    # Load Wisconsin breast cancer dataset
    data = load_breast_cancer(as_frame=True)
    X = data.data
    y = data.target  # 0 = malignant, 1 = benign

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Random Forest handles non-linear feature interactions well
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    print("Breast Cancer Classification — Random Forest")
    print("-" * 45)
    print(f"Accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions, target_names=data.target_names))

    # Show top 5 most important features
    importances = sorted(
        zip(data.feature_names, model.feature_importances_),
        key=lambda x: x[1],
        reverse=True,
    )
    print("Top 5 Features:")
    for name, score in importances[:5]:
        print(f"  {name:25s} {score:.3f}")


if __name__ == "__main__":
    main()
