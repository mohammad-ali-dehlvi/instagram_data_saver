from pathlib import Path
from types import CoroutineType
from typing import Any, Callable

from playwright.async_api import BrowserContext, StorageState, async_playwright

from utils.instagram_data_saver.utils.post_functions import MultiPostProgressDict, extract_data_from_list, set_script_json_response

async def save_post_multiple_internal(context: BrowserContext, id: str, n: int = 0, progress_callback: Callable[[MultiPostProgressDict], Any] | None = None):
    URL = f"https://www.instagram.com/{id}"
    page = await context.new_page()

    future = await set_script_json_response(page, n, progress_callback=progress_callback)

    await page.goto(URL)

    await page.wait_for_timeout(2000)

    await future

    script_data_list = future.result()

    result = extract_data_from_list(script_data_list)

    return result

async def save_post_multiple(id: str, storage_state: StorageState | str | Path | None = None, n: int = 0, progress_callback: Callable[[MultiPostProgressDict], Any] | None = None):
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=True)
        context = await browser.new_context(storage_state=storage_state)
        result = await save_post_multiple_internal(context, id, n, progress_callback)
        # await scroll_to_bottom(page, 2)

        await browser.close()

    return result

if __name__ == "__main__":
    import asyncio
    asyncio.run(save_post_multiple("okalun_", storage_state="data/beast.json", n=-1))
    # asyncio.run(save_post_multiple("mohammad_ali_dehlvi", storage_state="data/beast.json", n=-1))


