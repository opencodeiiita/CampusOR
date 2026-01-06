# Wait Time Prediction – Baseline ML Model

## Overview
This module trains and evaluates a machine learning model to predict the
estimated waiting time (in minutes) for users based on historical queue data.
The goal is to establish a reliable baseline model before backend or API
integration.

---

## Dataset
- File: `campusor_wait_time_mock.csv`
- Records: 1000
- The dataset was loaded and used without modification.

---

## Features Used
The following features were used for training:

- `tokensAhead`
- `activeCounters`
- `hourOfDay`
- `dayOfWeek`
- `avgServiceTime`

**Target Variable**
- `actualWaitMinutes`

---

## Models Evaluated
Three models were trained and evaluated:

- **Linear Regression** – simple and interpretable baseline
- **Random Forest Regressor** – preferred model
- **Gradient Boosting Regressor** – evaluated for comparison only

---

## Evaluation Results

| Model             | MAE (minutes) | RMSE (minutes) |
|-------------------|---------------|----------------|
| Linear Regression | ~11.32        | ~16.17         |
| Random Forest     | ~3.20         | ~4.18          |
| Gradient Boosting | ~2.94(similar)     | ~3.93(similar)       |

Random Forest reduced average prediction error by approximately **70%**
compared to the Linear Regression baseline.

---

## Why Random Forest Was Preferred Over Gradient Boosting

Although Random Forest and Gradient Boosting achieved similar accuracy,
Random Forest was selected as the preferred model for the following reasons:

| Aspect                     | Random Forest | Gradient Boosting |
|---------------------------|---------------|-------------------|
| Accuracy                  | High          | High (similar)    |
| Model stability           | **More stable** | Less stable       |
| Sensitivity to tuning     | **Low**       | Higher            |
| Risk of overfitting       | **Lower**     | Higher            |
| Ease of maintenance       | **Easier**    | Harder            |
| Suitability as baseline   | **Better**    | Less ideal        |

When performance differences are marginal, Random Forest provides a better
balance between accuracy, robustness, and maintainability.

---

## Final Model Choice
- **Baseline model:** Linear Regression  
- **Preferred saved model:** Random Forest Regressor  
- **Comparison-only model:** Gradient Boosting Regressor  

---

## Output
- The trained Random Forest model is saved as:

