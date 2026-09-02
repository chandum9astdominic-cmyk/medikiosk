from abc import ABC, abstractmethod

class BaseSpeechProvider(ABC):
    """Abstract base class for Speech-to-Text and Text-to-Speech providers."""

    @abstractmethod
    async def speech_to_text(self, audio_data: bytes) -> str:
        """Convert audio data to text."""
        pass

    @abstractmethod
    async def text_to_speech(self, text: str) -> bytes:
        """Convert text to audio data."""
        pass
