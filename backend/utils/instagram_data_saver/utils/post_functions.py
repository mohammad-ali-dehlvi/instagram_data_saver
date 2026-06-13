import asyncio
import json
import re
from types import CoroutineType
from typing import Any, Callable, Literal, Optional, TypedDict

from asyncio import Future
from urllib.parse import parse_qsl, urlencode
from playwright.async_api import Page, Request, Response, Route

from utils.instagram_data_saver.post.models import MultiplePostProfileItem, MultiplePostResponse, PostBaseProfileItem, PostMediaItem, PostProfileItem, PostResponse
from utils.instagram_data_saver.utils.functions import get, get_first, get_key_paths, is_callback_async, save_json, scroll_to_bottom


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

def get_posts_len(script_data_list):
    result = 0
    for script_data in script_data_list:
        items = get_items(script_data, priority_key='edges')
        result += len(items)
    return result

class MultiPostProgressDict(TypedDict):
    completed: int
    total: int


async def set_script_json_response(
    page: Page,
    n: int = 0,
    timeout_ms: int = 5000,
    progress_callback: Callable[[MultiPostProgressDict], Any] | None = None
) -> Future[list]:

    script_data_list: list[dict] = []
    lock = asyncio.Lock()

    loop = asyncio.get_running_loop()
    future: Future[list] = loop.create_future()

    timeout_task: asyncio.Task | None = None

    media_count_dict: MultiPostProgressDict = {
        'completed': 0,
        'total': 0
    }

    async def handle_progress():
        if progress_callback and n < 0:
            media_count_dict['completed'] = get_posts_len(script_data_list)
            is_async = is_callback_async(progress_callback)
            if is_async:
                await progress_callback(media_count_dict)
            else:
                progress_callback(media_count_dict)

    def finish():
        if not future.done():
            # pass
            future.set_result(script_data_list)

    async def timeout_handler():
        try:
            await asyncio.sleep(timeout_ms / 1000)
            finish()
        except asyncio.CancelledError:
            pass

    def reset_timeout():
        nonlocal timeout_task

        if timeout_task and not timeout_task.done():
            timeout_task.cancel()

        timeout_task = asyncio.create_task(timeout_handler())

    async def handle_response(res: Response):
        try:
            req = res.request
            payload = req.post_data

            if not payload:
                return
            
            if 'api/graphql' in req.url:
                try:
                    json_data = await res.json()
                    text = json.dumps(json_data)
                    if 'media_count' in text:
                        media_count = get_first(json_data, get_key_paths(json_data, 'media_count'))
                        media_count_dict['total'] = media_count
                except:
                    pass


            if "count" not in payload or "username" not in payload:
                return

            async with lock:
                if future.done():
                    return

                # Reset timer because we received a matching response
                reset_timeout()

                json_data = await res.json()
                
                script_data_list.append(json_data)
                # script_data_list.append(req.post_data_json)
                await handle_progress()

                if n == 0:
                    finish()
                    return

                if len(script_data_list) > n and n > 0:
                    finish()
                    return

            await page.wait_for_timeout(250)

            scrolled = await scroll_to_bottom(page, 1)
            if not scrolled:
                finish()

        except Exception:
            pass

    context = page.context
    context.on("response", handle_response)

    # Start initial timer
    reset_timeout()

    # Cleanup when future completes
    def cleanup(_):
        if timeout_task and not timeout_task.done():
            timeout_task.cancel()

    future.add_done_callback(cleanup)

    return future
    


def extract_user_details(data: Any):
    username_paths = get_key_paths(data, ['user', 'username'])
    username = get_first(data, username_paths)

    full_name_paths = get_key_paths(data, ['user', 'full_name'])
    full_name = get_first(data, full_name_paths)

    profile_pic_url_paths = get_key_paths(data, ['user', 'profile_pic_url'])
    profile_pic_url = get_first(data, profile_pic_url_paths)

    return PostBaseProfileItem(full_name=full_name, username=username, profile_pic_url=profile_pic_url)

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
    if len(carousel_media_paths) > 0:
        if len(carousel_media_paths[0]) == 1:
            copy_item.pop(key)
        else:
            obj = get(data, carousel_media_paths[0][:-1])
            obj.pop(key)
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
    return [item]

def get_items(script_data: Any, priority_key: Literal['items', 'edges'] = 'items'):
    alt_key = 'edges' if priority_key == 'items' else 'items'
    items_paths = get_key_paths(script_data, priority_key)
    if len(items_paths) == 0:
        items_paths = get_key_paths(script_data, alt_key)

    items = get_first(script_data, items_paths, optional_return=[])

    return items

def extract_details_from_item(item: Any):
    profile_item = extract_user_details(item)
    product_type_paths = get_key_paths(item, 'product_type')
    product_type: Literal['carousel_container', 'clips', 'feed'] | None = get_first(item, product_type_paths)

    result: PostProfileItem | None = None
    
    if product_type == 'carousel_container':
        cover_media, media = extract_carousel_media(item)

        result = PostProfileItem.from_dict({
            **profile_item.to_dict(),
            'cover_media': cover_media.to_dict(),
            'media': [m.to_dict() for m in media]
        })
        
    elif product_type == 'clips' or product_type == 'feed':
        media = extract_clips_media(item)
        
        result = PostProfileItem.from_dict({
            **profile_item.to_dict(),
            'media': [m.to_dict() for m in media]
        })

    return result

def extract_data(script_data: Any):
    items = get_items(script_data)

    post_response = PostResponse()

    for item in items:
        profile_item = extract_details_from_item(item)
        if profile_item:
            post_response.result.append(profile_item)
    
    return post_response

def extract_data_from_list(script_data_list: list[Any]):
    result = MultiplePostResponse()
    
    for script_data in script_data_list:
        items = get_items(script_data, priority_key='edges')

        for item in items:
            profile_item = extract_details_from_item(item)

            if profile_item:
                result.add_profile_item(profile_item)
    
    return result
            
    