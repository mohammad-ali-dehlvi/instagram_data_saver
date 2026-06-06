from fastapi import Request
from playwright.async_api import Playwright


def get_playwright(request: Request):
    playwright: Playwright = request.app.state.playwright
    return playwright