import pandas as pd
import numpy as np
import os

np.random.seed(42)

rows = 500

data = {
    "tokensAhead": np.random.randint(0, 60, rows),
    "activeCounters": np.random.randint(1, 6, rows),
    "hourOfDay": np.random.randint(8, 22, rows),
    "dayOfWeek": np.random.randint(0, 7, rows),
    "avgServiceTime": np.random.uniform(1.5, 6.0, rows),
}

df = pd.DataFrame(data)

df["actualWaitMinutes"] = (
    df["tokensAhead"] * df["avgServiceTime"] / df["activeCounters"]
    + np.random.normal(0, 2, rows)
).clip(0)

# Save to current directory
output_path = "campusor_wait_time_mock.csv"
df.to_csv(output_path, index=False)

print(f"Dataset created at {output_path}")
print(f"\nDataset shape: {df.shape}")
print(f"\nFirst 5 rows:")
print(df.head())
print(f"\nDataset statistics:")
print(df.describe())
print(f"\nMissing values:")
print(df.isnull().sum())
