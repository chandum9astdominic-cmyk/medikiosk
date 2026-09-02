from app.providers.speech.base import BaseSpeechProvider

class MockSpeechProvider(BaseSpeechProvider):
    """Deterministic Mock Speech Provider for testing and fallback."""

    async def speech_to_text(self, audio_data: bytes) -> str:
        return "mock transcribed text from audio"

    async def text_to_speech(self, text: str) -> bytes:
        return b"mock_audio_bytes"
