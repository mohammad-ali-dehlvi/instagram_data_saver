import json
import re
from typing import Any, Literal

from playwright.async_api import Page, async_playwright

from utils.functions import get, get_first, get_key_paths, save_json
from utils.instagram_post_saver.models import PostMediaItem, PostProfileItem, PostResponse


async def set_script_json(page: Page, save_file=False):
    script_data = []
    scripts = await page.query_selector_all("script")
    for script in scripts:
        text = await script.inner_text()
        if text and 'grid' not in text and 'username' in text and ('image_version' in text or 'video_version' in text):
            try:
                json_data = json.loads(text)
                script_data.append(json_data)
            except Exception as e:
                continue

    if save_file:
        save_json(script_data, 'script_data.json')
    
    return script_data

def extract_user_details(data: Any):
    username_paths = get_key_paths(data, ['user', 'username'])
    username = get_first(data, username_paths)

    full_name_paths = get_key_paths(data, ['user', 'full_name'])
    full_name = get_first(data, full_name_paths)

    profile_pic_url_paths = get_key_paths(data, ['user', 'profile_pic_url'])
    profile_pic_url = get_first(data, profile_pic_url_paths)

    return PostProfileItem(full_name=full_name, username=username, profile_pic_url=profile_pic_url)

def extract_image_and_video(data: Any):
    def get_url(paths: list[list[str | int]]):
        result = {
            'url': None,
            'area': 0
        }

        for path in paths:
            obj = get(data, path[:-1])
            if 'width' in obj and 'height' in obj:
                area = obj['width'] * obj['height']
                if result['area'] < area:
                    result['area'] = area
                    result['url'] = obj['url']
            elif not result['url']:
                result['url'] = obj['url']
                result['area'] = 0
        return result

    image_version_paths = get_key_paths(data, [re.compile(r'image_v.*'), 'url'])
    video_version_paths = get_key_paths(data, [re.compile(r'video_v.*'), 'url'])

    image_result = get_url(image_version_paths)
    video_result = get_url(video_version_paths)

    result = {
        'image_url': image_result['url'],
        'video_url': video_result['url']
    }
    return result

def extract_carousel_media(data: Any):
    key: Literal['carousel_media'] = 'carousel_media'
    carousel_media_paths = get_key_paths(data, key)
    carousel_media = get_first(data, carousel_media_paths)

    
    copy_item: dict = {**data}
    copy_item.pop(key)
    cover_result = extract_image_and_video(copy_item)

    cover_media_item = PostMediaItem(image_url=cover_result['image_url'], video_url=cover_result['video_url'])
    media_items: list[PostMediaItem] = []

    for item in carousel_media:
        result = extract_image_and_video(item)
        item = PostMediaItem(image_url=result['image_url'], video_url=result['video_url'])
        media_items.append(item)
    
    return cover_media_item, media_items

def extract_clips_media(data: Any):
    result = extract_image_and_video(data)
    item = PostMediaItem(image_url=result['image_url'], video_url=result['video_url'])
    return item

def extract_data(script_data: Any):
    items_paths = get_key_paths(script_data, 'items')
    if len(items_paths) == 0:
        items_paths = get_key_paths(script_data, 'edges')
    items = get_first(script_data, items_paths, optional_return=[])
    print(items_paths)

    post_response = PostResponse()

    for item in items:
        profile_item = extract_user_details(item)
        product_type_paths = get_key_paths(item, 'product_type')
        product_type: Literal['carousel_container', 'clips', 'feed'] | None = get_first(item, product_type_paths)
        print(product_type)
        if product_type == 'carousel_container':
            cover_media, media = extract_carousel_media(item)
            profile_item.cover_media = cover_media
            profile_item.media = media
            
        elif product_type == 'clips':
            media = extract_clips_media(item)
            profile_item.media = [media]

        elif product_type == 'feed':
            media = extract_clips_media(item)
            profile_item.media = [media]
        
        post_response.result.append(profile_item)
    
    return post_response

async def save_post(url: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel='chrome', headless=True)
        context = await browser.new_context(storage_state="data/beast.json")

        page = await context.new_page()

        await page.goto(url)

        script_json = await set_script_json(page)

        await browser.close()

    result = extract_data(script_json)

    return result

    # multiple_post_json = load_json('../test/multiple_post_script_data.json')
    # reel_json = load_json('../test/reel_script_data.json')
    # single_json = load_json('../test/single_post_script_data.json')

    # extract_data(multiple_post_json)
    # extract_data(reel_json)
    # extract_data(single_json)