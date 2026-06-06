import asyncio
import sys

# from backend.routers.stories import stories_router
from routers.stories import stories_router
from routers.posts import posts_router

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from contextlib import asynccontextmanager
from playwright.async_api import async_playwright
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    playwright = await async_playwright().start()
    app.state.playwright = playwright
    # browser = await playwright.chromium.launch(headless=True)
    # context = await browser.new_context(storage_state="data/beast.json")
    print("STARTED")
    yield
    print("STOPPED")
    # await context.close()
    # await browser.close()
    await playwright.stop()

app = FastAPI(
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # The origin of your frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


app.include_router(stories_router)
app.include_router(posts_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", reload=False)