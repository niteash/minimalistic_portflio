"""
Project 06: Time Series Forecasting
Forecast monthly airline passenger counts using moving average and linear trend.
"""

from pathlib import Path

import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

CACHE_DIR = Path(__file__).parent / ".seaborn_cache"


def main():
    # Classic airline passengers dataset (built into seaborn)
    CACHE_DIR.mkdir(exist_ok=True)
    df = sns.load_dataset("flights", data_home=str(CACHE_DIR))
    df["month"] = pd.to_datetime(
        df["year"].astype(str) + "-" + df["month"].astype(str),
        format="%Y-%b",
    )
    df = df.sort_values("month").reset_index(drop=True)

    # Use last 12 months as test set
    train = df.iloc[:-12].copy()
    test = df.iloc[-12:].copy()

    # --- Method 1: 12-month moving average baseline ---
    ma_window = 12
    train["ma_pred"] = train["passengers"].rolling(window=ma_window).mean()
    last_ma = train["ma_pred"].iloc[-1]
    ma_forecast = np.full(len(test), last_ma)

    # --- Method 2: Linear trend on time index ---
    train["t"] = np.arange(len(train))
    test["t"] = np.arange(len(train), len(train) + len(test))

    trend_model = LinearRegression()
    trend_model.fit(train[["t"]], train["passengers"])
    trend_forecast = trend_model.predict(test[["t"]])

    # Evaluate both methods
    ma_mae = mean_absolute_error(test["passengers"], ma_forecast)
    trend_mae = mean_absolute_error(test["passengers"], trend_forecast)
    trend_rmse = mean_squared_error(test["passengers"], trend_forecast) ** 0.5

    print("Airline Passengers — Time Series Forecast")
    print("-" * 42)
    print(f"Train period : {train['month'].iloc[0].strftime('%Y-%m')} to "
          f"{train['month'].iloc[-1].strftime('%Y-%m')}")
    print(f"Test period  : {test['month'].iloc[0].strftime('%Y-%m')} to "
          f"{test['month'].iloc[-1].strftime('%Y-%m')}")
    print(f"\n12-Month Moving Average MAE : {ma_mae:.1f} passengers")
    print(f"Linear Trend MAE            : {trend_mae:.1f} passengers")
    print(f"Linear Trend RMSE           : {trend_rmse:.1f} passengers")
    print(f"Trend slope                 : {trend_model.coef_[0]:.2f} passengers/month")

    print("\nLast 6 months — Actual vs. Trend Forecast:")
    comparison = test[["month", "passengers"]].copy()
    comparison["trend_forecast"] = trend_forecast.round(0).astype(int)
    comparison["month"] = comparison["month"].dt.strftime("%Y-%m")
    print(comparison.tail(6).to_string(index=False))


if __name__ == "__main__":
    main()
