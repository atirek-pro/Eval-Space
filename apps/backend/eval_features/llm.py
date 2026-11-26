"""Loads Gemini through Google's official Gen AI SDK (google-genai).

One client is created on first use and shared by every request (it keeps its HTTP connections open), then
closed when the app shuts down. The API key comes only from settings (GEMINI_API_KEY in backend/.env).
"""
from functools import lru_cache

from google import genai
from google.genai import types

from config import get_settings


class LLMNotConfigured(Exception):
    """GEMINI_API_KEY isn't set."""


@lru_cache
def get_gemini_client() -> genai.Client:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise LLMNotConfigured
    return genai.Client(
        api_key=settings.gemini_api_key,
        http_options=types.HttpOptions(timeout=settings.gemini_timeout_seconds * 1000),  # milliseconds
    )


async def close_gemini_client() -> None:
    """Called on shutdown: closes the client's connections if it was ever created."""
    if get_gemini_client.cache_info().currsize:
        await get_gemini_client().aio.aclose()
        get_gemini_client.cache_clear()
