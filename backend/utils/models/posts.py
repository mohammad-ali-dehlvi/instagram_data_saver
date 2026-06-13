

from typing import Generic, Literal, Optional, TypeVar, TypedDict

from pydantic import BaseModel

class PostAllJobResponse(BaseModel):
    job_id: str

T = TypeVar("T")

class JobData(BaseModel, Generic[T]):
    event: Literal['progress', 'completed', 'error']
    completed: Optional[float | int] = None
    total: Optional[float | int] = None
    data: Optional[T] = None

