"""Calls Gemini with the client from llm.py: answers a query, and lists the available models."""
import asyncio
import logging
import time
from contextlib import asynccontextmanager

import httpx2  # google-genai's HTTP library: timeouts and connection errors come from it
from google.genai import errors

from config import get_settings

from .llm import LLMNotConfigured, get_gemini_client

log = logging.getLogger(__name__)

MODELS_CACHE_SECONDS = 600  # the model list rarely changes; don't ask Google on every page load


class LLMRequestError(Exception):
    """Google refused this request (unknown model, invalid input, or no answer was produced)."""


class LLMBusy(Exception):
    """Google's rate limit or quota was hit."""


class LLMUnavailable(Exception):
    """Google couldn't be reached, timed out, or failed on its side."""


@asynccontextmanager
async def _gemini_errors(action: str, model: str | None = None):
    """Turns the SDK's errors into the four errors above. Google's own messages are logged, never returned."""
    try:
        yield
    except errors.ClientError as exc:
        log.warning("Gemini refused %s (model=%s, code=%s): %s", action, model, exc.code, exc.message)
        if exc.code == 429:
            raise LLMBusy from exc
        if exc.code in (401, 403):  # a bad or revoked API key is a server setup problem, not the user's
            raise LLMNotConfigured from exc
        if exc.code == 404 and model:
            raise LLMRequestError(f"The model '{model}' doesn't exist or isn't available.") from exc
        raise LLMRequestError("The model couldn't process this request.") from exc
    except (errors.ServerError, httpx2.HTTPError) as exc:
        log.warning("Gemini unavailable for %s (model=%s): %r", action, model, exc)
        raise LLMUnavailable from exc


async def ask_model(query: str, model: str | None = None) -> dict:
    """Sends the query to the model and returns {"model": ..., "answer": ...}."""
    model = model or get_settings().gemini_model
    client = get_gemini_client()  # raises LLMNotConfigured without an API key

    async with _gemini_errors("a query", model):
        response = await client.aio.models.generate_content(model=model, contents=query)

    if not response.text:  # e.g. blocked by safety filters
        raise LLMRequestError("The model returned no answer for this query.")
    return {"model": model, "answer": response.text}


_models_cache: dict = {"models": None, "expires": 0.0}
_models_lock = asyncio.Lock()


def _model_info(m) -> dict:
    actions = list(m.supported_actions or [])
    model_id = (m.name or "").removeprefix("models/")  # what /eval/query takes as `model`
    return {
        "id": model_id,
        "display_name": m.display_name,
        "description": m.description,
        "input_token_limit": m.input_token_limit,
        "output_token_limit": m.output_token_limit,
        "supported_actions": actions,
        # generates text, and is a Gemini model (the only names /eval/query accepts)
        "can_query": "generateContent" in actions and model_id.startswith("gemini-"),
    }


async def list_models() -> list[dict]:
    """Every model the API key can use, all pages, cached for MODELS_CACHE_SECONDS."""
    client = get_gemini_client()  # raises LLMNotConfigured without an API key
    async with _models_lock:  # many page loads at once still make one call to Google
        if _models_cache["models"] is not None and time.monotonic() < _models_cache["expires"]:
            return _models_cache["models"]
        async with _gemini_errors("listing models"):
            models = [_model_info(m) async for m in await client.aio.models.list()]
        _models_cache.update(models=models, expires=time.monotonic() + MODELS_CACHE_SECONDS)
        return models
