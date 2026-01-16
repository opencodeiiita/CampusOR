from pydantic import BaseModel, Field, conint, confloat, validator

from typing import Annotated

class PredictRequest(BaseModel):
    tokensAhead: Annotated[int, Field(ge=0)]
    activeCounters: Annotated[int, Field(ge=1)]
    hoursOfDay: Annotated[int, Field(ge=0, le=23)]
    dayOfWeek: Annotated[int, Field(ge=0, le=6)]
    avgServiceTime: Annotated[float, Field(ge=0)]

class PredictResponse(BaseModel):
    estimatedWaitMinutes: float
    modelVersion: str

class HealthResponse(BaseModel):
    status: str