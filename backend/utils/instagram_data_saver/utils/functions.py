import functools
import inspect
import json
from pathlib import Path
import re
import subprocess
from typing import Any, Callable, Coroutine
import requests
from playwright.async_api import Page


def save_json(data: Any, file_name: str):
    caller = inspect.stack()[1].filename
    path = Path.joinpath(Path(caller).parent, file_name).resolve()
    if not path.parent.exists():
        path.parent.mkdir(parents=True, exist_ok=True)

    with path.open('w', encoding="utf-8") as file:
        file.write(json.dumps(data, indent=2))

def load_json(file_name: str):
    caller = inspect.stack()[1].filename
    path = Path.joinpath(Path(caller).parent, file_name).resolve()
    with path.open('r') as file:
        return json.loads(file.read())

def get_key_paths(
    obj: Any,
    target_keys: str | re.Pattern | list[str | re.Pattern],
) -> list[list[Any]]:
    if not obj:
        return []
    
    if not isinstance(target_keys, list):
        target_keys = [target_keys]

    def matches(pattern: str | re.Pattern, key: str) -> bool:
        if isinstance(pattern, str):
            return pattern == key
        return bool(pattern.search(key))

    results: list[list[Any]] = []

    def walk(current: Any, path: list[Any], matched_depth: int) -> None:
        if isinstance(current, dict):
            for key, value in current.items():
                new_path = path + [key]

                next_depth = matched_depth

                if matched_depth < len(target_keys) and matches(
                    target_keys[matched_depth], key
                ):
                    next_depth += 1

                    if next_depth == len(target_keys):
                        results.append(new_path)

                walk(value, new_path, next_depth)

        elif isinstance(current, list):
            for index, value in enumerate(current):
                walk(value, path + [index], matched_depth)

    walk(obj, [], 0)
    return results

def get(data: Any, keys: list[Any]) -> Any:
    if not data:
        return None
    temp = data
    for key in keys:
        temp = temp[key]
    return temp

def get_first(data:Any, keys: list[list[str | int]], optional_return: Any | None = None):
    return get(data, keys[0]) if len(keys) > 0 else optional_return

def get_video_dimensions(url: str) -> tuple[int, int]:
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_streams",
            url,
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    data = json.loads(result.stdout)

    for stream in data["streams"]:
        if stream.get("codec_type") == "video":
            return stream["width"], stream["height"]

    print("No video stream found")
    return 0, 0

def download_file(url: str, output_path: str | Path):
    response = requests.get(url, stream=True)
    response.raise_for_status()

    with open(output_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)


async def scroll_to_bottom(page: Page, n: int = 0):
    """
    Scroll to the bottom of the page.

    If new content loads and increases the page height,
    continue scrolling to the new bottom up to `n` additional times.

    Args:
        page: Playwright page instance.
        n: Number of additional scroll attempts after the initial scroll.
           Can be 0.
        wait_ms: Time to wait after each scroll for lazy-loaded content.
    """
    attempts = n  # initial scroll + n extra checks

    last_height = await page.evaluate(
        "document.documentElement.scrollHeight"
    )

    wait_ms = 100

    total_wait_ms = 2500

    scrolled = False

    for _ in range(attempts):
        # Scroll to current bottom
        await page.evaluate(
            "window.scrollTo(0, document.documentElement.scrollHeight)"
        )
        scrolled = True

        count = 0
        while True:
            new_height = await page.evaluate(
                "document.documentElement.scrollHeight"
            )
            await page.wait_for_timeout(wait_ms)

            if new_height > last_height or count * wait_ms >= total_wait_ms:
                break

            count += 1

        
        # No new content loaded
        if new_height <= last_height:
            break

        last_height = new_height

    return scrolled

ProgressCallback = Callable[[Any], None | Coroutine[Any, Any, None]]

def is_callback_async(callback: ProgressCallback) -> bool:
    """Returns True if the callback is an async function."""
    # Handle partial wrappers
    while isinstance(callback, functools.partial):
        callback = callback.func
        
    # Check if the callable or its __call__ method is a coroutine function
    return (
        inspect.iscoroutinefunction(callback) or 
        inspect.iscoroutinefunction(getattr(callback, "__call__", None))
    )