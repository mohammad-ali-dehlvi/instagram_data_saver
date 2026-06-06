from fastapi import APIRouter, Depends, Request

# from backend.utils.dependencies import get_playwright
# from backend.utils.instagram_story_saver.functions import StoryResponse
# from backend.utils.instagram_story_saver.story_saver import save_story
from utils.dependencies import get_playwright
from utils.instagram_story_saver.models import StoryResponse
from utils.instagram_story_saver.story_saver import save_story

stories_router = APIRouter(prefix='/stories')

@stories_router.get('/save', response_model=StoryResponse, description='Download stories as well as highlights')
async def stories_or_highlights(url_or_id: str, playwright=Depends(get_playwright)):
    data = await save_story(url_or_id, pbc=playwright)

    return data