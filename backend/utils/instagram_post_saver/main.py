import asyncio

from playwright.async_api import async_playwright
from backend.utils.instagram_post_saver.post_saver import save_post

if __name__ == '__main__':
    async def main():
        async with async_playwright() as p:
            # URL = "https://www.instagram.com/p/C69FZ4WJtdO/"
            # URL = "https://www.instagram.com/islam/reel/DZMyQgDNelQ/" # reel
            # URL = "https://www.instagram.com/islam/p/DZKHpq1Df1X/" # multiple posts
            # URL = "https://www.instagram.com/islam/p/DTqaUePjXoX/?hl=en" # single post
            URL = "https://www.instagram.com/p/DZII-Q9GKhT/"
            # print("TEST")
            await save_post(URL, p)

    asyncio.run(main())