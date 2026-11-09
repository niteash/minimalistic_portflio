## Airline Passenger Forecasting

### Problem Statement
Forecast monthly international airline passenger counts using simple time-series baselines.

### Dataset
- **Source:** seaborn `load_dataset("flights")` (1949–1960 monthly data)
- **Target:** Number of passengers per month

### Approach
1. Sort data chronologically; hold out the last 12 months for testing
2. **Baseline:** 12-month moving average (flat forecast)
3. **Trend model:** Linear regression on a time index
4. Compare MAE and RMSE; print last 6 months of actual vs. forecast

### Result
Linear trend typically achieves **MAE ≈ 40–60 passengers** on the final year. A flat moving-average baseline is simpler but misses upward growth.

### How to Run
```bash
cd project-06
pip install -r requirements.txt
python main.py
```
