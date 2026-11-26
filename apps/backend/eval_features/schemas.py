from typing import Annotated

from pydantic import BaseModel, StringConstraints

Query = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=8000)]
# Only Gemini model ids, e.g. "gemini-3.8-flash"; anything else is refused before reaching Google.
ModelName = Annotated[str, StringConstraints(pattern=r"^gemini-[a-z0-9][a-z0-9.\-]{0,62}$")]


class QueryRequest(BaseModel):
    query: Query
    model: ModelName | None = None  # defaults to GEMINI_MODEL


class QueryResponse(BaseModel):
    model: str
    answer: str


class ModelInfo(BaseModel):
    id: str  # pass this as `model` to /eval/query
    display_name: str | None = None
    description: str | None = None
    input_token_limit: int | None = None
    output_token_limit: int | None = None
    supported_actions: list[str] = []
    can_query: bool  # supports generateContent, so /eval/query can use it


class ModelList(BaseModel):
    models: list[ModelInfo]
