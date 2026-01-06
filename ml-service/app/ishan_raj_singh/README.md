# Wait Time Prediction Model

## Author
ISHAN RAJ SINGH

## Model Overview
This solution trains a machine learning model to predict queue wait times based on historical data.

## Features Used
- **tokensAhead**: Number of tokens ahead in queue
- **activeCounters**: Number of active service counters
- **hourOfDay**: Hour of the day (0-23)
- **dayOfWeek**: Day of week (0-6)
- **avgServiceTime**: Average service time in minutes

## Target Variable
- **actualWaitMinutes**: Actual waiting time in minutes

## Models Trained
1. **Linear Regression**: Baseline simple model
2. **Random Forest Regressor**: Tree-based ensemble model

## Output
Dataset shape: (500, 6)

First few rows:
   tokensAhead  activeCounters  hourOfDay  dayOfWeek  avgServiceTime  actualWaitMinutes
0           38               2         13          1        5.406244         101.300392
1           51               1         11          4        5.834565         299.271733
2           28               4         17          1        1.640860          12.583083
3           14               5          9          3        4.790715          11.569137
4           42               4         18          0        5.592860          61.767377
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 500 entries, 0 to 499
Data columns (total 6 columns):
 #   Column             Non-Null Count  Dtype
---  ------             --------------  -----
 0   tokensAhead        500 non-null    int64
 1   activeCounters     500 non-null    int64
 2   hourOfDay          500 non-null    int64
 3   dayOfWeek          500 non-null    int64
 4   avgServiceTime     500 non-null    float64
 5   actualWaitMinutes  500 non-null    float64
dtypes: float64(2), int64(4)
memory usage: 23.6 KB

Dataset info:
None

Basic statistics:
       tokensAhead  activeCounters   hourOfDay   dayOfWeek  avgServiceTime  actualWaitMinutes
count   500.000000      500.000000  500.000000  500.000000      500.000000         500.000000
mean     30.396000        3.030000   14.268000    2.884000        3.752320          51.243714
std      17.335982        1.460605    4.033946    1.983535        1.237269          51.798936
min       0.000000        1.000000    8.000000    0.000000        1.501496           0.000000
25%      16.750000        2.000000   11.000000    1.000000        2.683200          16.867524
50%      31.000000        3.000000   14.000000    3.000000        3.831921          37.836632
75%      45.000000        4.000000   18.000000    5.000000        4.760008          66.611501
max      59.000000        5.000000   21.000000    6.000000        5.979662         326.284808

Missing values:
tokensAhead          0
activeCounters       0
hourOfDay            0
dayOfWeek            0
avgServiceTime       0
actualWaitMinutes    0
dtype: int64

Training set size: 400
Test set size: 100

==================================================
Training Linear Regression Model...
==================================================

Linear Regression Results:
MAE: 20.98 minutes
RMSE: 30.06 minutes
R² Score: 0.6739

==================================================
Training Random Forest Model...
==================================================

Random Forest Results:
MAE: 4.56 minutes
RMSE: 6.59 minutes
R² Score: 0.9843

Feature Importance (Random Forest):
  tokensAhead: 0.4553
  activeCounters: 0.3625
  hourOfDay: 0.0066
  dayOfWeek: 0.0045
  avgServiceTime: 0.1711

==================================================
Model Comparison
==================================================

Best Model: Random Forest
MAE: 4.56 minutes
RMSE: 6.59 minutes
R² Score: 0.9843

Model saved as: wait_time_model.pkl


## How to Run

```bash
python train_model.py