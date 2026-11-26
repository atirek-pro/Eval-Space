from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from auth.routes import current_user

from .llm import LLMNotConfigured
from .schemas import ModelList, QueryRequest, QueryResponse
from .services import LLMBusy, LLMRequestError, LLMUnavailable, ask_model, list_models

router = APIRouter(prefix="/eval", tags=["eval-features"])

_ERRORS = {
    400: {"description": "Google refused the request"},
    401: {"description": "Not signed in"},
    429: {"description": "Gemini rate limit or quota reached"},
    502: {"description": "Gemini unreachable or failed"},
    503: {"description": "Gemini isn't set up on this server"},
}


async def _call(coro):
    """Runs a Gemini call and turns its errors into HTTP responses."""
    try:
        return await coro
    except LLMNotConfigured:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "The Gemini model isn't set up on this server")
    except LLMRequestError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc))
    except LLMBusy:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Gemini is busy right now. Try again shortly.")
    except LLMUnavailable:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Couldn't reach Gemini. Try again.")


@router.get("/models", response_model=ModelList, summary="List Gemini models", responses=_ERRORS)
async def get_models(user: Annotated[dict, Depends(current_user)]):
    """Every Gemini model this server's API key can use. `can_query` marks the ones /eval/query accepts.
    Cached for 10 minutes. Signed-in users only."""
    return {"models": await _call(list_models())}


@router.post(
    "/query",
    response_model=QueryResponse,
    summary="Ask a Gemini model",
    responses=_ERRORS,
)
async def query_model(body: QueryRequest, user: Annotated[dict, Depends(current_user)]):
    """Sends the query to a Gemini model and returns its answer. Signed-in users only."""
    return await _call(ask_model(body.query, body.model))
