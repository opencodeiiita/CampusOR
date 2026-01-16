import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'wait_time_model.pkl')
MODEL_VERSION = 'random-forest-v1'

class WaitTimeModel:
    def __init__(self):
        self.model = joblib.load(MODEL_PATH)

    def predict(self, features):
        # Features order: [tokensAhead, activeCounters, hoursOfDay, dayOfWeek, avgServiceTime]
        pred = self.model.predict([features])[0]
        return max(0, round(float(pred), 2))

wait_time_model = WaitTimeModel()