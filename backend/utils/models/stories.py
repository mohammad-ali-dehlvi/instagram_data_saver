from pydantic import BaseModel
from utils.models.generated.storage_state import StorageState

class StoriesOrHighlightsRequest(BaseModel):
    url_or_id: str
    storage_state: StorageState | None = None