import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

# Load dataset
DATA_PATH = "../../data/campusor_wait_time_mock.csv"
df = pd.read_csv(DATA_PATH)

# Display basic info
print("Dataset shape:", df.shape)
print("Columns:", df.columns.tolist())

# Feature selection
features = [
    "tokensAhead",
    "activeCounters",
    "hourOfDay",
    "dayOfWeek",
    "avgServiceTime"
]

target = "actualWaitMinutes"

X = df[features]
y = df[target]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

# Train model
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluation
mae = mean_absolute_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred) ** 0.5  # FIXED for older sklearn

print("\nModel Evaluation:")
print("MAE:", round(mae, 2))
print("RMSE:", round(rmse, 2))

# Save model
model_path = "model.joblib"
joblib.dump(model, model_path)

print(f"\nModel saved to {model_path}")
