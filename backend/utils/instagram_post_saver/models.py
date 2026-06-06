
from enum import Enum
from typing import Literal, Optional, TypedDict

from pydantic import BaseModel

class PostMediaItemToDict(TypedDict):
    image_url: Optional[str]
    video_url: Optional[str]

class PostMediaItem(BaseModel):
    image_url: str | None
    video_url: str | None

    def to_dict(self):
        result: PostMediaItemToDict = {
            'image_url': self.image_url,
            'video_url': self.video_url
        }
        return result

class PostProfileItemToDict(TypedDict):
    full_name: Optional[str]
    username: Optional[str]
    profile_pic_url: Optional[str]
    cover_media: Optional[PostMediaItemToDict]
    media: list[PostMediaItemToDict]

class PostProfileItem(BaseModel):
    full_name: str | None
    username: str | None
    profile_pic_url: str | None
    cover_media: PostMediaItem | None = None
    media: list[PostMediaItem] = []

    def to_dict(self):
        result: PostProfileItemToDict = {
            'full_name': self.full_name,
            'username': self.username,
            'profile_pic_url': self.profile_pic_url,
            'media': [m.to_dict() for m in self.media],
            'cover_media': self.cover_media.to_dict() if self.cover_media else None
        }
        return result

class PostResponseToDict(TypedDict):
    result: list[PostProfileItemToDict]

class PostResponse(BaseModel):
    result: list[PostProfileItem] = []

    def to_dict(self):
        result: PostResponseToDict = {
            'result': [p.to_dict() for p in self.result]
        }
        return result