from fastapi import Request
from fastapi.responses import JSONResponse


class LLMException(Exception):
    pass


async def llm_exception_handler(request: Request, exc: LLMException):
    return JSONResponse(
        status_code=500,
        content={"error": "LLM service failed", "detail": str(exc)}
    )