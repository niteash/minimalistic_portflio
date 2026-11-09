## Titanic Survival EDA

### Problem Statement
Perform a structured exploratory data analysis on the Titanic passenger dataset to understand survival patterns and data quality.

### Dataset
- **Source:** seaborn `load_dataset("titanic")`
- **Samples:** ~891 passengers
- **Key columns:** survived, sex, age, class, fare, embark_town

### Approach
1. Overview: shape, columns, dtypes
2. Missing-value audit
3. Survival rates overall and grouped by sex, class, and embark town
4. Numeric summaries for age and fare
5. Print actionable key insights

### Result
Console report highlights well-known patterns: **~74% female vs. ~19% male survival**, first-class passengers fared much better, and fare correlates with survival chances.

### How to Run
```bash
cd project-10
pip install -r requirements.txt
python main.py
```
