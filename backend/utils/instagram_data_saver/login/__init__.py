
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright

from main import generate_browser_storage_state_enum

async def login_with_browser(file_path: Path):
    loop = asyncio.get_running_loop()
    future = loop.create_future()
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel='chrome', headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        await context.expose_function("saveAndClose", lambda: future.set_result(True))

        await context.add_init_script(
            script="""
                if (window.self !== window.top) {
                    return;
                }
                const button = document.createElement("button");
                button.id = "custom_close_button"
                button.innerText = "Save and close browser"
                
                Object.assign(button.style, {
                  whiteSpace: "nowrap",
                  position: "fixed",
                  left: "calc(100% - 10px)",
                  bottom: "10px",
                  transform: "translateX(-100%)",
                  zIndex: "9999",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "700",
                  background: "white",
                  border: "1px solid black",
                  boxShadow: "2px 3px 5px rgba(0,0,0,0.5)",
                  cursor: "pointer",
                })
                
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
    async def main():
        file_name = "_".join(input("Enter file name: ").split(" ")).lower()
        await login_with_browser(f"data/{file_name}.json")
        print("generating enums")
        generate_browser_storage_state_enum()

    asyncio.set_event_loop_policy(
        asyncio.WindowsProactorEventLoopPolicy()
    )
    asyncio.run(main())