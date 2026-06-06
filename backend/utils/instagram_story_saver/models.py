
from typing import Optional, TypedDict

from pydantic import BaseModel

class StoryMediaItemToDict(TypedDict):
    image_url: str | None
    video_url: str | None

class StoryDictToMediaItem(TypedDict):
    image_url: Optional[str]
    video_url: Optional[str]

class StoryMediaItem(BaseModel):
    image_url: str | None = None
    video_url: str | None = None

    def to_dict(self):
        
        result: StoryMediaItemToDict = {
            'image_url': self.image_url,
            'video_url': self.video_url
        }
        return result

    @staticmethod
    def from_dict(d: StoryDictToMediaItem):
        return StoryMediaItem(
            image_url=d['image_url'] if 'image_url' in d else None,
            video_url=d['video_url'] if 'video_url' in d else None
        )
            

class StoryProfileItemToDict(TypedDict):
    username: str
    profile_pic_url: Optional[str]
    media: list[StoryMediaItemToDict]


class StoryProfileItem(BaseModel):
    username: str
    profile_pic_url: str | None = None
    media: list[StoryMediaItem] = []

    def add_media(self, media_item: StoryMediaItem | StoryDictToMediaItem):
        media_ins = StoryMediaItem.from_dict(media_item) if isinstance(media_item, dict) else media_item
        self.media.append(media_ins)

    def to_dict(self) -> StoryProfileItemToDict:
        return {
            'username': self.username,
            'profile_pic_url': self.profile_pic_url,
            'media': [ins.to_dict() for ins in self.media]
        }

    
class StoryResponseToDict(TypedDict):
    result: list[StoryProfileItemToDict]

class StoryResponse(BaseModel):
    result: list[StoryProfileItem]=[]

    def add_profile_item(self, item: StoryProfileItem):
        self.result.append(item)

    def to_dict(self) -> StoryResponseToDict:
        return {
            'result': [ins.to_dict() for ins in self.result]
        }


    