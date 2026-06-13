
from pathlib import Path

from playwright.async_api import StorageState, async_playwright

from utils.instagram_data_saver.post.save_post import set_script_json
from utils.instagram_data_saver.utils.story_functions import extract_stories_media




async def save_story(url_or_id: str, storage_state: StorageState | str | Path | None = None):
    async with async_playwright() as p:
    # p = await async_playwright().start() if not pbc else pbc
        browser = await p.chromium.launch(channel='chrome', headless=True)
        context = await browser.new_context(storage_state=storage_state)
        page = await context.new_page()

        # URL = f'https://www.instagram.com/stories/{id}/'
        URL = url_or_id if url_or_id.startswith('https') else f'https://www.instagram.com/stories/{url_or_id}/'

        await page.goto(URL)

        script_data = await set_script_json(page)

        # try:
        #     await page.get_by_text('View story', exact=True).click()
        # except Exception as e:
        #     print(e)
        
        # await page.wait_for_timeout(2500)

        await browser.close()

    return extract_stories_media(script_data)