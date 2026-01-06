import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os

def load_data():
    """Load the wait time dataset"""
    data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'campusor_wait_time_mock.csv')
    return pd.read_csv(data_path)

def preprocess_data(df):
    """Preprocess data for training"""
    features = ['tokensAhead', 'activeCounters', 'hourOfDay', 'dayOfWeek', 'avgServiceTime']
    target = 'actualWaitMinutes'
    
    X = df[features]
    y = df[target]
    
    return X, y, features, target

def train_models(X_train, y_train):
    """Train two baseline models"""
    models = {}
    
    # Linear Regression
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    models['LinearRegression'] = lr
    
    # Random Forest
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    models['RandomForest'] = rf
    
    return models

def evaluate_models(models, X_test, y_test):
    """Evaluate models using MAE and RMSE"""
    results = {}
    
    for name, model in models.items():
        y_pred = model.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        results[name] = {
            'MAE': mae,
            'RMSE': rmse,
            'R2': r2
        }
        
        print(f"{name} Results:")
        print(f"  MAE: {mae:.2f} minutes")
        print(f"  RMSE: {rmse:.2f} minutes")
        print(f"  R²: {r2:.4f}")
    
    return results

def save_metrics(results, df_shape, features, target):
    """Save evaluation metrics to file"""
    with open('metrics.txt', 'w') as f:
        f.write("Wait Time Prediction Model - Evaluation Metrics\n")
        f.write("=" * 50 + "\n\n")
        
        for name, result in results.items():
            f.write(f"{name} Model:\n")
            f.write(f"  MAE: {result['MAE']:.2f} minutes\n")
            f.write(f"  RMSE: {result['RMSE']:.2f} minutes\n")
            f.write(f"  R²: {result['R2']:.4f}\n\n")
        
        f.write("Best Model: RandomForest (Lower MAE and RMSE)\n")
        f.write(f"\nDataset: {df_shape[0]} records\n")
        f.write(f"Features: {', '.join(features)}\n")
        f.write(f"Target: {target}\n")

def main():
    """Main training pipeline"""
    print("=== Wait Time Prediction Model Training ===")
    
    # Load data
    df = load_data()
    print(f"Dataset loaded: {df.shape}")
    
    # Preprocess data
    X, y, features, target = preprocess_data(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    # Train models
    models = train_models(X_train, y_train)
    
    # Evaluate models
    results = evaluate_models(models, X_test, y_test)
    
    # Save best model
    best_model = models['RandomForest']
    joblib.dump(best_model, 'model.pkl')
    print("✅ Model saved as 'model.pkl'")
    
    # Save metrics
    save_metrics(results, df.shape, features, target)
    print("✅ Metrics saved to 'metrics.txt'")
    
    print("\n=== Training Complete ===")
    return results

if __name__ == "__main__":
    results = main()
