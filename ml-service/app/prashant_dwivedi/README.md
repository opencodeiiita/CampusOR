# Wait Time Prediction Model

## Overview
Trained machine learning models to predict estimated waiting time (in minutes) for users based on historical queue data from CampusOR system.

## Files
- `train.py` - Final reproducible training script
- `model.pkl` - Trained Random Forest model (best performing)
- `metrics.txt` - Model evaluation results (MAE, RMSE, R²)

## Dataset
- **Source**: `campusor_wait_time_mock.csv`
- **Records**: 1000 samples
- **Features**: tokensAhead, activeCounters, hourOfDay, dayOfWeek, avgServiceTime
- **Target**: actualWaitMinutes

## Model Performance
Two models were trained and compared:

### Random Forest (Best Model)
- Lower MAE and RMSE
- Better R² score
- Captures non-linear relationships

### Linear Regression (Baseline)
- Simpler interpretable model
- Good for comparison

## Key Findings
1. **Most Important Features**: tokensAhead and avgServiceTime
2. **Model Choice**: Random Forest outperforms Linear Regression
3. **Ready for Integration**: Saved model can be loaded by any Python application

## Usage
```python
import joblib
import pandas as pd

# Load model
model = joblib.load('model.pkl')

# Make prediction
features = ['tokensAhead', 'activeCounters', 'hourOfDay', 'dayOfWeek', 'avgServiceTime']
sample_data = pd.DataFrame([[5, 2, 14, 3, 4]], columns=features)
prediction = model.predict(sample_data)[0]
print(f"Predicted wait time: {prediction:.1f} minutes")
```

## Training
Run the training script:
```bash
python train.py
```

This will:
- Load and preprocess the dataset
- Train both models
- Evaluate performance
- Save the best model as `model.pkl`
- Save metrics to `metrics.txt`
