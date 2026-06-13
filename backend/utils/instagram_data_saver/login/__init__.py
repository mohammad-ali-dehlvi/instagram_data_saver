
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright

async def login_with_browser(file_path: Path):
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel='chrome', headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        loop = asyncio.get_running_loop()
        future = loop.create_future()

        await context.expose_function("saveAndClose", lambda: future.set_result(True))

        await context.add_init_script(
            script="""
                const button = document.createElement("button");
                button.id = "custom_close_button"
                button.innerText = "Save and close browser"
                button.style.position = "sticky"
                button.style.left = "calc(100% - 10px)"
                button.style.bottom = "10px"
                button.style.transform = "translateX(-100%)"
                button.style.zIndex = "99999"
                
                button.addEventListener("click", () => {
                    window.saveAndClose()
                })

                document.addEventListener("DOMContentLoaded", ()=>{
                    document.body.appendChild(button)
                })

            """
        )

        await page.goto("https://instagram.com/")

        await future

        await context.storage_state(path=file_path)

        await page.close()

        await context.close()

        await browser.close()

        return future.result()

if __name__ == "__main__":
    asyncio.run(login_with_browser("data/beast1.json"))