"""
Project 01: Linear Regression on California Housing
Predict median house value from features using scikit-learn.
"""

from sklearn.datasets import fetch_california_housing
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


def main():
    # Load built-in dataset (no manual download needed)
    data = fetch_california_housing(as_frame=True)
    X = data.data
    y = data.target

    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train a simple linear regression model
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Evaluate on held-out data
    predictions = model.predict(X_test)
    rmse = mean_squared_error(y_test, predictions) ** 0.5
    r2 = r2_score(y_test, predictions)

    print("California Housing — Linear Regression")
    print("-" * 40)
    print(f"Features used : {list(X.columns)}")
    print(f"RMSE          : {rmse:.3f} (in $100k units)")
    print(f"R² Score      : {r2:.3f}")
    print("\nSample predictions (actual → predicted):")
    for actual, pred in zip(y_test.head(5), predictions[:5]):
        print(f"  ${actual * 100_000:,.0f} → ${pred * 100_000:,.0f}")


if __name__ == "__main__":
    main()
