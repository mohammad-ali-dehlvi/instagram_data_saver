from pathlib import Path

from playwright.async_api import BrowserContext, StorageState, async_playwright

from utils.instagram_data_saver.utils.post_functions import extract_data, set_script_json

async def save_post_internal(context: BrowserContext, url: str):
    page = await context.new_page()

    await page.goto(url)

    script_json = await set_script_json(page)

    result = extract_data(script_json)

    return result


async def save_post(url: str, storage_state: StorageState | str | Path | None = None):
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel='chrome', headless=True)
        context = await browser.new_context(storage_state=storage_state)
        result = await save_post_internal(context, url)
        await browser.close()
    return result
        

    # multiple_post_json = load_json('../test/multiple_post_script_data.json')
    # reel_json = load_json('../test/reel_script_data.json')
    # single_json = load_json('../test/single_post_script_data.json')

    # extract_data(multiple_post_json)
    # extract_data(reel_json)
    # extract_data(single_json)