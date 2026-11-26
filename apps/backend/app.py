from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.routes import router as auth_router
from auth.routes import sso_router
from config import get_settings
from database import create_pool, verify_schema
from eval_features.llm import close_gemini_client
from eval_features.routes import router as eval_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    pool = await create_pool(settings.database_url)
    try:
        await verify_schema(pool)
    except Exception:
        await pool.close()
        raise
    app.state.pool = pool
    yield
    await close_gemini_client()
    await pool.close()


app = FastAPI(title="Eval Space API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,  # lets the browser send and store the refresh token cookie
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["Retry-After"],  # lets the frontend read how long a rate-limited sign-in must wait
)

app.include_router(auth_router)
app.include_router(sso_router)
app.include_router(eval_router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
