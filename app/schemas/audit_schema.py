from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, Dict

class TransactionBase(BaseModel):
    trans_id: str
    dept_name: str
    admin_level: str
    amount: float
    vendor_id: str
    item_category: str
    latitude: float
    longitude: float

class TransactionCreate(TransactionBase):
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class TransactionResponse(TransactionBase):
    id: str = Field(..., alias="_id")
    risk_score: float
    anomaly_reason: Optional[str]
    status: str
    timestamp: datetime
    metadata: Dict
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)