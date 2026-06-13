from datetime import datetime
import json
from pathlib import Path
import re
from typing import Any

from playwright.async_api import Page

from utils.instagram_data_saver.story.models import StoryMediaItem, StoryProfileItem, StoryResponse
from utils.instagram_data_saver.utils.functions import download_file, get, get_first, get_key_paths, get_video_dimensions, save_json

async def set_script_json(page: Page, save_file=False):
    script_data = []
    scripts = await page.query_selector_all("script")
    for script in scripts:
        text = await script.inner_text()
        if text and 'username' in text and ('image_version' in text or 'video_version' in text):
            try:
                json_data = json.loads(text)
                script_data.append(json_data)
            except Exception as e:
                continue

    if save_file:
        save_json(script_data, "temp_saved_data/script_data.json")
    
    return script_data

def extract_stories_media(data: list[Any], download: bool = False):
    items_paths = get_key_paths(data, 'items')

    story_response = StoryResponse()

    for items_path in items_paths:
        parent_obj = get(data, items_path[:-1])
        username_path = get_key_paths(parent_obj, ['user', 'username'])
        username: str = get_first(parent_obj, username_path, optional_return='FILE')

        profile_pic_url_paths = get_key_paths(parent_obj, ['user', 'profile_pic_url'])
        profile_pic_url: str | None = get_first(parent_obj, profile_pic_url_paths)
        
        items_list = get(data, items_path)

        profile_item = StoryProfileItem(username=username, profile_pic_url=profile_pic_url)

        for item_obj in items_list:

            result_image: str | None = None
            result_video: str | None = None
            
            image_version_paths = get_key_paths(item_obj, [re.compile(r'image_v.*')])
            for path in image_version_paths:
                image_obj = get(item_obj, path)
                url_paths = get_key_paths(image_obj, 'url')

                # {url: str; width: int; height: int}
                max_dimension_image: Any | None = None
                
                for url_path in url_paths:
                    url_obj = get(image_obj, url_path[:-1])
                    if 'width' in url_obj and 'height' in url_obj:
                        area = url_obj['width'] * url_obj['height']
                        if not max_dimension_image or max_dimension_image['area'] < area:
                            max_dimension_image = {**url_obj, 'area': area}
                
                if not max_dimension_image and len(url_paths) > 0:
                    max_dimension_image = get(image_obj, url_paths[0][:-1])

                if max_dimension_image:
                    result_image = max_dimension_image['url']

            video_version_paths = get_key_paths(item_obj, [re.compile(r'video_v.*')])
            for path in video_version_paths:
                video_obj = get(item_obj, path)
                url_paths = get_key_paths(video_obj, 'url')

                # {url: str, area: int}
                max_dimension_video: Any | None = None

                for url_path in url_paths:
                    url = get(video_obj, url_path)
                    width, height = get_video_dimensions(url)
                    area = width * height
                    if not max_dimension_video or max_dimension_video['area'] < area:
                        max_dimension_video = {'url': url, 'area': area}
                
                if not max_dimension_video and len(url_paths) > 0:
                    max_dimension_video = get(video_obj, url_paths[0][:-1])
                
                if max_dimension_video:
                    result_video = max_dimension_video['url']

            profile_item.add_media(StoryMediaItem(image_url=result_image, video_url=result_video))

        story_response.add_profile_item(profile_item)

    if download:
        for profile_item in story_response.result:
            username = profile_item.username
            output_path = Path(f'data/stories/{username}')

            if not output_path.exists():
                output_path.mkdir(parents=True)

            for index, media in enumerate(profile_item.media):

                image_url = media.image_url
                video_url = media.video_url

                current_time = datetime.now()

                format_time = current_time.strftime('%d_%m_%Y_%H_%M')

                file_name = f'{username}_{index}_{format_time}'

                if image_url:
                    download_file(image_url, Path.joinpath(output_path, file_name+'.png'))
                if video_url:
                    download_file(video_url, Path.joinpath(output_path, file_name+'.mp4'))

    return story_response