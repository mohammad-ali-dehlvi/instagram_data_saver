import asyncio
import uuid

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

from utils.instagram_data_saver.utils.post_functions import MultiPostProgressDict
from utils.functions import get_storage_state
from utils.models.posts import JobData, PostAllJobResponse
from utils.instagram_data_saver import MultiplePostResponse, PostResponse, save_post, save_post_multiple
from utils.models.generated.storage_state import StorageState

posts_router = APIRouter(prefix='/posts')

@posts_router.get('/save', response_model=PostResponse, description="Download 'post' and 'reels'")
async def posts_save(url: str, storage_state: StorageState | None = None):
    data = await save_post(url, storage_state=get_storage_state(storage_state).value)

    return data



jobs: dict[str, list[JobData]] = {}

@posts_router.get('/all/job', response_model=PostAllJobResponse)
async def posts_all(id: str, storage_state: StorageState | None = None):
    job_id = str(uuid.uuid4())
    jobs[job_id] = []
    async def main(job_id: str):
        try:
            async def progress_callback(d: MultiPostProgressDict):
                jobs[job_id].append(
                    JobData(
                        event='progress',
                        completed=d['completed'],
                        total=d['total']
                    )
                )
                await asyncio.sleep(0)
            data: MultiplePostResponse = await save_post_multiple(
                id,
                storage_state=get_storage_state(storage_state).value,
                n=-1,
                progress_callback=progress_callback
            )
            jobs[job_id].append(JobData(event='completed', data=data))
        except Exception:
            jobs[job_id].append(JobData(event='error'))

    asyncio.create_task(main(job_id=job_id))
    
    return PostAllJobResponse(job_id=job_id)


@posts_router.get('/all/{job_id}', response_model=JobData[MultiplePostResponse])
async def posts_all_event(job_id: str):
    async def event_generator():
        last_index = 0

        while True:
            if job_id not in jobs:
                result: JobData = JobData(event='error')
                yield {
                    'event': result.event,
                    'data': result.model_dump_json()
                }
                return

            job = jobs[job_id]
            latest_event: JobData | None = None

            while last_index < len(job):
                latest_event = job[last_index]
                yield {
                    'event': latest_event.event,
                    'data': latest_event.model_dump_json()
                }
                last_index += 1

            if latest_event and latest_event.event in ('completed', 'error'):
                return

            await asyncio.sleep(1)

    return EventSourceResponse(event_generator())
