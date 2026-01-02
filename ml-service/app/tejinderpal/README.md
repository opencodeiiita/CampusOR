# Wait-Time Prediction Model

**Author:** Tejinderpal Singh  
**Models:** XGBoost + Ridge Regression

## Overview

Predicts queue wait times using gradient boosting and regularized linear regression.

## Model Choices

| Model   | Rationale                                                                 |
| ------- | ------------------------------------------------------------------------- |
| XGBoost | Captures non-linear patterns. Defaults: `n_estimators=100`, `max_depth=4` |
| Ridge   | Handles multicollinearity via L2 regularization                           |

## Features

**Original:** queueId, tokensAhead, activeCounters, hourOfDay, dayOfWeek, avgServiceTime

**Engineered:**

- `load_factor` = tokensAhead / activeCounters
- `is_peak_hour` = 1 if hour in [11-14]
- `is_weekend` = 1 if day in [5,6]

## Model Performance

| Model       | MAE      | RMSE     | R²         | CV_MAE   |
| ----------- | -------- | -------- | ---------- | -------- |
| **XGBoost** | **2.32** | **3.13** | **0.9885** | **2.28** |
| Ridge       | 7.89     | 12.33    | 0.8217     | 8.19     |

**Best Model: XGBoost** (selected by lowest CV MAE)

## Residual Analysis (XGBoost)

| Wait Time Range | MAE  | Samples |
| --------------- | ---- | ------- |
| 0-20 min        | 1.90 | 97      |
| 20-60 min       | 2.28 | 82      |
| 60+ min         | 4.34 | 21      |

## Feature Importance

| Feature            | Importance |
| ------------------ | ---------- |
| load_factor        | 0.6488     |
| avgServiceTime     | 0.2492     |
| queueId_clinic_opd | 0.0443     |
| is_peak_hour       | 0.0253     |
| queueId_cafeteria  | 0.0156     |

## Usage

```bash
cd ml-service/app/tejinderpal
pip install pandas scikit-learn numpy joblib xgboost
python train_model.py
```

## Output

- `wait_time_model.joblib` - Trained XGBoost model

## Compliance

- No deep learning
- No API integration
- No excessive tuning (uses defaults)
- Dataset not modified
