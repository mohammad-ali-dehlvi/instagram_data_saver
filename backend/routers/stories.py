from fastapi import APIRouter

from utils.functions import get_storage_state
from utils.instagram_data_saver import StoryResponse, save_story
from utils.models.generated.storage_state import StorageState

stories_router = APIRouter(prefix='/stories')

@stories_router.get('/save', response_model=StoryResponse, description='Download stories as well as highlights')
async def stories_or_highlights(url_or_id: str, storage_state: StorageState | None = None):
    data = await save_story(url_or_id, storage_state=get_storage_state(storage_state).value)

    return data