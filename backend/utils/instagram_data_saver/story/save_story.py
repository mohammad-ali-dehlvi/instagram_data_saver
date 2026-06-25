
from pathlib import Path

from playwright.async_api import BrowserContext, Page, StorageState, async_playwright

from utils.instagram_data_saver.post.save_post import set_script_json
from utils.instagram_data_saver.utils.story_functions import extract_stories_media


async def save_story_internal(context: BrowserContext, url_or_id: str):
    page = await context.new_page()

    # URL = f'https://www.instagram.com/stories/{id}/'
    URL = url_or_id if url_or_id.startswith('https') else f'https://www.instagram.com/stories/{url_or_id}/'

    await page.goto(URL)

    script_data = await set_script_json(page)

    return extract_stories_media(script_data)



async def save_story(url_or_id: str, storage_state: StorageState | str | Path | None = None):
    async with async_playwright() as p:
    # p = await async_playwright().start() if not pbc else pbc
        browser = await p.chromium.launch(channel='chrome', headless=True)
        context = await browser.new_context(storage_state=storage_state)
        result = await save_story_internal(context, url_or_id)
        
        await browser.close()

    return result