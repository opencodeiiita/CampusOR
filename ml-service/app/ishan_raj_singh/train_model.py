import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os

# Load the dataset
print("Loading dataset...")
df = pd.read_csv('campusor_wait_time_mock.csv')

# Display basic info
print(f"\nDataset shape: {df.shape}")
print(f"\nFirst few rows:\n{df.head()}")
print(f"\nDataset info:\n{df.info()}")
print(f"\nBasic statistics:\n{df.describe()}")

# Check for missing values
print(f"\nMissing values:\n{df.isnull().sum()}")

# Define features and target
features = ['tokensAhead', 'activeCounters', 'hourOfDay', 'dayOfWeek', 'avgServiceTime']
target = 'actualWaitMinutes'

# Verify all columns exist
missing_cols = [col for col in features + [target] if col not in df.columns]
if missing_cols:
    print(f"Error: Missing columns: {missing_cols}")
    exit(1)

X = df[features]
y = df[target]

# Split the data (80-20 train-test split)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"\nTraining set size: {len(X_train)}")
print(f"Test set size: {len(X_test)}")

# Model 1: Linear Regression
print("\n" + "="*50)
print("Training Linear Regression Model...")
print("="*50)

lr_model = LinearRegression()
lr_model.fit(X_train, y_train)
lr_pred = lr_model.predict(X_test)

lr_mae = mean_absolute_error(y_test, lr_pred)
lr_rmse = np.sqrt(mean_squared_error(y_test, lr_pred))
lr_r2 = r2_score(y_test, lr_pred)

print(f"\nLinear Regression Results:")
print(f"MAE: {lr_mae:.2f} minutes")
print(f"RMSE: {lr_rmse:.2f} minutes")
print(f"R² Score: {lr_r2:.4f}")

# Model 2: Random Forest Regressor
print("\n" + "="*50)
print("Training Random Forest Model...")
print("="*50)

rf_model = RandomForestRegressor(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train, y_train)
rf_pred = rf_model.predict(X_test)

rf_mae = mean_absolute_error(y_test, rf_pred)
rf_rmse = np.sqrt(mean_squared_error(y_test, rf_pred))
rf_r2 = r2_score(y_test, rf_pred)

print(f"\nRandom Forest Results:")
print(f"MAE: {rf_mae:.2f} minutes")
print(f"RMSE: {rf_rmse:.2f} minutes")
print(f"R² Score: {rf_r2:.4f}")

# Feature importance analysis
print(f"\nFeature Importance (Random Forest):")
for feat, imp in zip(features, rf_model.feature_importances_):
    print(f"  {feat}: {imp:.4f}")

# Select best model
print("\n" + "="*50)
print("Model Comparison")
print("="*50)

if rf_mae < lr_mae:
    best_model = rf_model
    best_model_name = "Random Forest"
    best_mae = rf_mae
    best_rmse = rf_rmse
    best_r2 = rf_r2
else:
    best_model = lr_model
    best_model_name = "Linear Regression"
    best_mae = lr_mae
    best_rmse = lr_rmse
    best_r2 = lr_r2

print(f"\nBest Model: {best_model_name}")
print(f"MAE: {best_mae:.2f} minutes")
print(f"RMSE: {best_rmse:.2f} minutes")
print(f"R² Score: {best_r2:.4f}")

# Save the best model
model_filename = 'wait_time_model.pkl'
joblib.dump(best_model, model_filename)
print(f"\nModel saved as: {model_filename}")

# Save model metadata
metadata = {
    'model_type': best_model_name,
    'features': features,
    'mae': best_mae,
    'rmse': best_rmse,
    'r2': best_r2
}

import json
with open('model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("\nTraining complete!")
