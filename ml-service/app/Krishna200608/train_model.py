import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
from pathlib import Path

# --------------------------------------------------
# 1. Load Dataset (robust path handling)
# --------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
csv_path = BASE_DIR / "campusor_wait_time_mock.csv"

print(f"Loading data from: {csv_path}")

try:
    df = pd.read_csv(csv_path)
    print(f"Data loaded successfully. Shape: {df.shape}")
except FileNotFoundError:
    print("Error: CSV file not found. Please check the path.")
    exit(1)

# --------------------------------------------------
# 2. Feature Selection
# --------------------------------------------------
features = [
    "tokensAhead",
    "activeCounters",
    "hourOfDay",
    "dayOfWeek",
    "avgServiceTime"
]
target = "actualWaitMinutes"

print("\nFeatures used for training:")
print(features)

X = df[features]
y = df[target]

# Train / Test split (80 / 20)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("-" * 50)
print(f"Training samples: {len(X_train)}")
print(f"Testing samples : {len(X_test)}")
print("-" * 50)

# --------------------------------------------------
# MODEL 1: Linear Regression (Baseline)
# --------------------------------------------------
lr_model = LinearRegression()
lr_model.fit(X_train, y_train)

lr_preds = lr_model.predict(X_test)
lr_mae = mean_absolute_error(y_test, lr_preds)

print(f"Model 1: Linear Regression -> MAE: {lr_mae:.4f} minutes")

# --------------------------------------------------
# MODEL 2: Random Forest (Proposed)
# --------------------------------------------------
rf_model = RandomForestRegressor(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train, y_train)

rf_preds = rf_model.predict(X_test)
rf_mae = mean_absolute_error(y_test, rf_preds)
rf_rmse = np.sqrt(mean_squared_error(y_test, rf_preds))

print(
    f"Model 2: Random Forest     -> "
    f"MAE: {rf_mae:.4f} minutes | RMSE: {rf_rmse:.4f} minutes"
)

# --------------------------------------------------
# Comparison
# --------------------------------------------------
improvement = ((lr_mae - rf_mae) / lr_mae) * 100

print("-" * 50)
print(
    f"Result: Random Forest improved accuracy by "
    f"{improvement:.1f}% over Linear Regression."
)
print("-" * 50)

# --------------------------------------------------
# 3. Save Best Model
# --------------------------------------------------
model_path = Path(__file__).resolve().parent / "wait_time_model.pkl"
joblib.dump(rf_model, model_path)

print(f"Saved best model (Random Forest) to: {model_path}")
