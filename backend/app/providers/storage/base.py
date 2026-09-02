from abc import ABC, abstractmethod
from typing import BinaryIO

class BaseStorageProvider(ABC):
    """Abstract base class for Storage providers."""

    @abstractmethod
    async def save_file(self, filename: str, content: bytes) -> str:
        """Save a file and return its path/URI."""
        pass

    @abstractmethod
    async def get_file(self, path: str) -> bytes:
        """Retrieve a file's content by path/URI."""
        pass
