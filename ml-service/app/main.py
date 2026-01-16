from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from schemas import PredictRequest, PredictResponse, HealthResponse
from model import wait_time_model, MODEL_VERSION

app = FastAPI()

@app.get('/health', response_model=HealthResponse)
def health():
    return {"status": "ok"}

@app.post('/predict', response_model=PredictResponse)
def predict(request: PredictRequest):
    try:
        features = [
            request.tokensAhead,
            request.activeCounters,
            request.hoursOfDay,
            request.dayOfWeek,
            request.avgServiceTime
        ]
        eta = wait_time_model.predict(features)
        return PredictResponse(estimatedWaitMinutes=eta, modelVersion=MODEL_VERSION)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Docker readiness: host/port config
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
