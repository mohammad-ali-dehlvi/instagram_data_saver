from fastapi import APIRouter

from utils.models.stories import StoriesOrHighlightsRequest
from utils.functions import get_storage_state
from utils.instagram_data_saver import StoryResponse, save_story
from utils.models.generated.storage_state import StorageState

stories_router = APIRouter(prefix='/stories')

@stories_router.post('/save', response_model=StoryResponse, description='Download stories as well as highlights')
async def stories_or_highlights(req: StoriesOrHighlightsRequest):
    data = await save_story(req.url_or_id, storage_state=get_storage_state(req.storage_state).value)

    return data