
from pathlib import Path
from utils.models.generated.storage_state import StorageState

def generate_browser_storage_state_enum():
    path = Path("data")

    result = """from enum import Enum

class StorageState(str, Enum):"""
    
    storage_state_items = ""

    for item in path.iterdir():
        if item.is_file() and item.name and item.name.endswith(".json"):
            name = item.name.upper().split(".")[0]
            path = item.as_posix()
            storage_state_items += f"\n  {name} = '{path}'"

    if len(storage_state_items) > 0:
        result += storage_state_items
    else:
        result += "\n   pass"

    models_path = Path("utils/models/generated/storage_state.py")

    if not models_path.parent.exists():
        models_path.parent.mkdir(parents=True, exist_ok=True)

    with models_path.open("w") as file:
        file.write(result)

def get_storage_state(storage_state: StorageState | None):
    if not storage_state:
        return StorageState.BEAST
    return storage_state