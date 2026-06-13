
from typing import Optional, TypedDict

from pydantic import BaseModel, PrivateAttr

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
    
    @staticmethod
    def from_dict(d: PostMediaItemToDict | None):
        if not d:
            return None
        return PostMediaItem(
            image_url=d['image_url'],
            video_url=d['video_url']
        )


class PostBaseProfileItemToDict(TypedDict):
    full_name: Optional[str]
    username: Optional[str]
    profile_pic_url: Optional[str]

class PostBaseProfileItem(BaseModel):
    full_name: str | None
    username: str | None
    profile_pic_url: str | None

    def to_dict(self):
        result: PostBaseProfileItemToDict = {
            'full_name': self.full_name,
            'profile_pic_url': self.profile_pic_url,
            'username': self.username
        }
        return result
    
class PostProfileItemToDict(PostBaseProfileItemToDict):
    cover_media: Optional[PostMediaItemToDict]
    media: list[PostMediaItemToDict]

class PostProfileItem(PostBaseProfileItem):
    cover_media: PostMediaItem | None = None
    media: list[PostMediaItem] = []

    def to_dict(self):
        base_profile_dict = super().to_dict()
        result: PostProfileItemToDict = {
            **base_profile_dict,
            'media': [m.to_dict() for m in self.media],
            'cover_media': self.cover_media.to_dict() if self.cover_media else None
        }
        return result
    
    @staticmethod
    def from_dict(d: PostProfileItemToDict):
        return PostProfileItem(
            full_name=d['full_name'],
            username=d['username'],
            profile_pic_url=d['profile_pic_url'],
            cover_media=PostMediaItem.from_dict(d['cover_media']) if 'cover_media' in d and d['cover_media'] else None,
            media=[PostMediaItem.from_dict(m) for m in d['media']]
        )

class PostResponseToDict(TypedDict):
    result: list[PostProfileItemToDict]

class PostResponse(BaseModel):
    result: list[PostProfileItem] = []

    def to_dict(self):
        result: PostResponseToDict = {
            'result': [p.to_dict() for p in self.result]
        }
        return result
    
class MultiplePostItemToDict(TypedDict):
    id: Optional[str | int]
    cover_media: Optional[PostMediaItemToDict]
    media: list[PostMediaItemToDict]
    
class MultiplePostItem(BaseModel):
    id: str | int | None = None
    cover_media: PostMediaItem | None = None
    media: list[PostMediaItem] = []

    def to_dict(self):
        result: MultiplePostItemToDict = {
            'id': self.id,
            'cover_media': self.cover_media.to_dict() if self.cover_media else None,
            'media': [m.to_dict() for m in self.media]
        }
        return result
    

class MultiplePostProfileItemToDict(PostBaseProfileItemToDict):
    posts: list[MultiplePostItemToDict]

class MultiplePostProfileItem(PostBaseProfileItem):
    posts: list[MultiplePostItem] = []

    def to_dict(self):
        base_profile_dict = super().to_dict()
        result: MultiplePostProfileItemToDict = {
            **base_profile_dict,
            'posts': [p.to_dict() for p in self.posts]
        }
        return result
    

class MultiplePostResponseToDict(TypedDict):
    result: list[MultiplePostProfileItemToDict] = []

class MultiplePostResponse(BaseModel):
    result: list[MultiplePostProfileItem] = []

    def to_dict(self):
        result: MultiplePostResponseToDict = {
            'result': [p.to_dict() for p in self.result]
        }
        return result
    
    _username_map: dict[str, MultiplePostProfileItem] = PrivateAttr(default_factory=dict)
    def add_profile_item(self, item: PostProfileItem):
        profile = self._username_map.get(item.username)

        post = MultiplePostItem(
            cover_media=item.cover_media,
            media=item.media,
        )

        if profile:
            profile.posts.append(post)
            return

        profile = MultiplePostProfileItem(
            full_name=item.full_name,
            username=item.username,
            profile_pic_url=item.profile_pic_url,
            posts=[post],
        )

        self.result.append(profile)
        self._username_map[item.username] = profile
        

