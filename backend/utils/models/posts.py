

from typing import Generic, Literal, Optional, TypeVar, TypedDict

from pydantic import BaseModel
from utils.models.generated.storage_state import StorageState

class PostAllJobResponse(BaseModel):
    job_id: str

T = TypeVar("T")

class JobData(BaseModel, Generic[T]):
    event: Literal['progress', 'completed', 'error']
    completed: Optional[float | int] = None
    total: Optional[float | int] = None
    data: Optional[T] = None

class PostSaveRequest(BaseModel):
    url: str
    storage_state: StorageState | None = None

class PostAllRequest(BaseModel):
    id: str
    storage_state: StorageState | None = None
