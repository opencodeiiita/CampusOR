# Wait-Time Prediction Model ⏳

This directory contains the training script and serialized model for predicting queue wait times.

## Model Choice
We compared two models to establish a baseline:
1.  **Linear Regression:** Failed to capture non-linear patterns (MAE ~5.1 min).
2.  **Random Forest Regressor:** Selected model. It successfully captures complex relationships between queue length and time of day (MAE ~3.2 min).

## Features Used
* `tokensAhead`: Number of people currently in the queue.
* `activeCounters`: Number of desks currently open.
* `hourOfDay`: Integer (0-23) to capture peak hours.
* `dayOfWeek`: Integer (0-6) to capture weekly patterns.
* `avgServiceTime`: Historical average time per person.

## Performance
* **MAE:** 3.20 minutes
* **RMSE:** 4.18 minutes