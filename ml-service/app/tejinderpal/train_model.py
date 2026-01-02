"""
Wait-Time Prediction Model Training
Author: Tejinderpal Singh
Models: XGBoost + Ridge Regression
"""

import os
import warnings
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

warnings.filterwarnings('ignore')

try:
    from xgboost import XGBRegressor
    USE_XGBOOST = True
except ImportError:
    from sklearn.ensemble import GradientBoostingRegressor
    USE_XGBOOST = False


def load_data(filepath):
    """Load dataset."""
    df = pd.read_csv(filepath)
    print(f"\nDataset: {len(df)} samples, {len(df.columns)} columns")
    print(f"Target stats: mean={df['actualWaitMinutes'].mean():.1f}, std={df['actualWaitMinutes'].std():.1f}")
    return df


def engineer_features(df):
    """Create additional features."""
    df = df.copy()
    df['load_factor'] = df['tokensAhead'] / df['activeCounters'].replace(0, 1)
    df['is_peak_hour'] = df['hourOfDay'].isin([11, 12, 13, 14]).astype(int)
    df['is_weekend'] = df['dayOfWeek'].isin([5, 6]).astype(int)
    print(f"Engineered features: load_factor, is_peak_hour, is_weekend")
    return df


def prepare_data(df):
    """Prepare features and target."""
    categorical_features = ['queueId']
    numeric_features = [
        'tokensAhead', 'activeCounters', 'hourOfDay', 'dayOfWeek', 
        'avgServiceTime', 'load_factor', 'is_peak_hour', 'is_weekend'
    ]
    
    X = df[categorical_features + numeric_features]
    y = df['actualWaitMinutes']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical_features),
            ('num', 'passthrough', numeric_features)
        ]
    )
    
    return X, y, preprocessor


def train_models(X, y, preprocessor):
    """Train and evaluate models."""
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"\nTrain: {len(X_train)}, Test: {len(X_test)}")
    
    results = {}
    models = {}
    
    # XGBoost / GradientBoosting
    model_name = "XGBoost" if USE_XGBOOST else "GradientBoosting"
    if USE_XGBOOST:
        gb_model = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42, verbosity=0)
    else:
        gb_model = GradientBoostingRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
    
    gb_pipeline = Pipeline([('preprocessor', preprocessor), ('regressor', gb_model)])
    gb_pipeline.fit(X_train, y_train)
    gb_pred = gb_pipeline.predict(X_test)
    
    gb_mae = mean_absolute_error(y_test, gb_pred)
    gb_rmse = np.sqrt(mean_squared_error(y_test, gb_pred))
    gb_r2 = r2_score(y_test, gb_pred)
    gb_cv = -cross_val_score(gb_pipeline, X, y, cv=5, scoring='neg_mean_absolute_error').mean()
    
    results[model_name] = {'MAE': gb_mae, 'RMSE': gb_rmse, 'R2': gb_r2, 'CV_MAE': gb_cv}
    models[model_name] = gb_pipeline
    
    # Ridge Regression
    ridge_pipeline = Pipeline([('preprocessor', preprocessor), ('regressor', Ridge(alpha=1.0))])
    ridge_pipeline.fit(X_train, y_train)
    ridge_pred = ridge_pipeline.predict(X_test)
    
    ridge_mae = mean_absolute_error(y_test, ridge_pred)
    ridge_rmse = np.sqrt(mean_squared_error(y_test, ridge_pred))
    ridge_r2 = r2_score(y_test, ridge_pred)
    ridge_cv = -cross_val_score(ridge_pipeline, X, y, cv=5, scoring='neg_mean_absolute_error').mean()
    
    results['Ridge'] = {'MAE': ridge_mae, 'RMSE': ridge_rmse, 'R2': ridge_r2, 'CV_MAE': ridge_cv}
    models['Ridge'] = ridge_pipeline
    
    return results, models, y_test, gb_pred, ridge_pred


def print_results(results):
    """Display model comparison."""
    print("\n" + "=" * 55)
    print(f"{'Model':<18} {'MAE':>8} {'RMSE':>8} {'R2':>8} {'CV_MAE':>10}")
    print("-" * 55)
    
    for name, m in results.items():
        print(f"{name:<18} {m['MAE']:>8.2f} {m['RMSE']:>8.2f} {m['R2']:>8.4f} {m['CV_MAE']:>10.2f}")
    
    print("=" * 55)
    best = min(results.items(), key=lambda x: x[1]['CV_MAE'])[0]
    print(f"Best model: {best}")
    return best


def analyze_residuals(y_test, predictions, model_name):
    """Check model performance on different wait time ranges."""
    y_arr = y_test.values
    residuals = y_arr - predictions
    
    print(f"\nResidual Analysis ({model_name}):")
    print(f"  Mean: {np.mean(residuals):.2f}, Std: {np.std(residuals):.2f}")
    
    ranges = [(0, 20, "0-20 min"), (20, 60, "20-60 min"), (60, 999, "60+ min")]
    for low, high, label in ranges:
        mask = (y_arr > low) & (y_arr <= high) if low > 0 else (y_arr <= high)
        if mask.sum() > 0:
            mae = mean_absolute_error(y_arr[mask], predictions[mask])
            print(f"  {label}: MAE={mae:.2f} (n={mask.sum()})")


def get_feature_importance(model, preprocessor):
    """Show top features."""
    cat_encoder = preprocessor.named_transformers_['cat']
    cat_names = cat_encoder.get_feature_names_out(['queueId']).tolist()
    num_names = ['tokensAhead', 'activeCounters', 'hourOfDay', 'dayOfWeek', 
                 'avgServiceTime', 'load_factor', 'is_peak_hour', 'is_weekend']
    all_names = cat_names + num_names
    
    regressor = model.named_steps['regressor']
    
    if hasattr(regressor, 'feature_importances_'):
        importances = regressor.feature_importances_
    elif hasattr(regressor, 'coef_'):
        importances = np.abs(regressor.coef_)
    else:
        return
    
    pairs = sorted(zip(all_names, importances), key=lambda x: x[1], reverse=True)
    
    print("\nFeature Importance (top 5):")
    for name, imp in pairs[:5]:
        print(f"  {name}: {imp:.4f}")


def save_model(model, model_name, output_dir):
    """Save trained model."""
    filepath = os.path.join(output_dir, 'wait_time_model.joblib')
    joblib.dump(model, filepath)
    print(f"\nModel saved: {filepath}")


def main():
    print("=" * 55)
    print("WAIT-TIME PREDICTION MODEL TRAINING")
    print("=" * 55)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, '..', '..', 'campusor_wait_time_mock.csv')
    
    df = load_data(data_path)
    df = engineer_features(df)
    X, y, preprocessor = prepare_data(df)
    
    results, models, y_test, gb_pred, ridge_pred = train_models(X, y, preprocessor)
    
    best_name = print_results(results)
    best_model = models[best_name]
    best_pred = gb_pred if 'XGBoost' in best_name or 'Gradient' in best_name else ridge_pred
    
    analyze_residuals(y_test, best_pred, best_name)
    get_feature_importance(best_model, preprocessor)
    save_model(best_model, best_name, script_dir)
    
    print("\n" + "=" * 55)
    print(f"TRAINING COMPLETE | Best: {best_name} | MAE: {results[best_name]['MAE']:.2f} min")
    print("=" * 55)


if __name__ == "__main__":
    main()
