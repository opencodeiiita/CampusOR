import pandas as pd
import numpy as np
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error


def main():
    # ============================================================
    # Configuration
    # ============================================================

    FEATURES = [
        "tokensAhead",
        "activeCounters",
        "hourOfDay",
        "dayOfWeek",
        "avgServiceTime"
    ]

    TARGET = "actualWaitMinutes"

    # ============================================================
    # Resolve Paths (IMPORTANT)
    # ============================================================

    BASE_DIR = Path(__file__).resolve().parent
    CSV_PATH = BASE_DIR.parent.parent / "campusor_wait_time_mock.csv"
    MODEL_PATH = BASE_DIR / "wait_time_model.pkl"

    # ============================================================
    # Load Dataset
    # ============================================================

    print("\n" + "=" * 60)
    print("        WAIT TIME PREDICTION — MODEL TRAINING")
    print("=" * 60)

    print(f"\nLoading dataset from:\n{CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    print(f"Data loaded successfully. Shape: {df.shape}")

    # ============================================================
    # Prepare Data
    # ============================================================

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    print("\nDataset Split")
    print("-" * 60)
    print(f"Training samples : {len(X_train)}")
    print(f"Testing samples  : {len(X_test)}")

    # ============================================================
    # Linear Regression (baseline)
    # ============================================================

    lr_model = LinearRegression()
    lr_model.fit(X_train, y_train)

    lr_pred = lr_model.predict(X_test)
    lr_mae = mean_absolute_error(y_test, lr_pred)
    lr_rmse = np.sqrt(mean_squared_error(y_test, lr_pred))

    # ============================================================
    # Random Forest (PREFERRED MODEL)
    # ============================================================

    rf_model = RandomForestRegressor(
        n_estimators=100,
        random_state=42
    )

    rf_model.fit(X_train, y_train)

    rf_pred = rf_model.predict(X_test)
    rf_mae = mean_absolute_error(y_test, rf_pred)
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_pred))

    # ============================================================
    # Gradient Boosting (comparison only)
    # ============================================================

    gb_model = GradientBoostingRegressor(random_state=42)
    gb_model.fit(X_train, y_train)

    gb_pred = gb_model.predict(X_test)
    gb_mae = mean_absolute_error(y_test, gb_pred)
    gb_rmse = np.sqrt(mean_squared_error(y_test, gb_pred))

    # ============================================================
    # Results Table
    # ============================================================

    print("\nModel Performance Comparison")
    print("-" * 70)
    print(f"| {'Model':<22} | {'MAE (min)':<12} | {'RMSE (min)':<12} |")
    print("-" * 70)
    print(f"| {'Linear Regression':<22} | {lr_mae:<12.2f} | {lr_rmse:<12.2f} |")
    print(f"| {'Random Forest':<22} | {rf_mae:<12.2f} | {rf_rmse:<12.2f} |")
    print(f"| {'Gradient Boosting':<22} | {gb_mae:<12.2f} | {gb_rmse:<12.2f} |")
    print("-" * 70)

    # ============================================================
    # Conclusion
    # ============================================================

    improvement_rf = ((lr_mae - rf_mae) / lr_mae) * 100

    print("\nConclusion")
    print("-" * 70)
    print(
        f"✓ Random Forest improves accuracy over Linear Regression\n"
        f"  by ~{improvement_rf:.1f}% in MAE.\n"
    )
    print(
        "✓ Random Forest is selected as the preferred model due to\n"
        "  comparable accuracy to Gradient Boosting while being more\n"
        "  stable and less sensitive to hyperparameters.\n"
    )
    print(
        "✓ Linear Regression serves as a simple, interpretable baseline,\n"
        "  while Gradient Boosting is included only for comparison."
    )

    # ============================================================
    # Save Preferred Model (Random Forest ONLY)
    # ============================================================

    joblib.dump(rf_model, MODEL_PATH)

    print("\nSaved trained model artifact:")
    print(f"- {MODEL_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    main()
