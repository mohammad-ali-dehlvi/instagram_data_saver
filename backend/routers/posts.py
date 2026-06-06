from fastapi import APIRouter, Depends

from utils.dependencies import get_playwright
from utils.instagram_post_saver.models import PostResponse
from utils.instagram_post_saver.post_saver import save_post

posts_router = APIRouter(prefix='/posts')

@posts_router.get('/save', response_model=PostResponse, description="Download 'post' and 'reels'")
async def posts_save(url: str, p=Depends(get_playwright)):
    data = await save_post(url, p)

    return data
