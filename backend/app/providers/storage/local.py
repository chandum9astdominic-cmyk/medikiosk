import os
import aiofiles
from app.providers.storage.base import BaseStorageProvider
from app.core.config import settings

class LocalStorageProvider(BaseStorageProvider):
    """Local filesystem storage implementation."""

    def __init__(self):
        self.storage_dir = settings.STORAGE_DIR
        os.makedirs(self.storage_dir, exist_ok=True)

    async def save_file(self, filename: str, content: bytes) -> str:
        # Sanitize filename to prevent path traversal
        safe_filename = os.path.basename(filename)
        file_path = os.path.join(self.storage_dir, safe_filename)
        # Ensure path resolves within storage_dir
        if not os.path.abspath(file_path).startswith(os.path.abspath(self.storage_dir)):
            raise ValueError("Invalid file path")
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        return file_path

    async def get_file(self, path: str) -> bytes:
        # Ensure path resolves within storage_dir to prevent arbitrary file read
        if not os.path.abspath(path).startswith(os.path.abspath(self.storage_dir)):
            raise ValueError("Invalid file access attempt")
        async with aiofiles.open(path, 'rb') as f:
            return await f.read()
