from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.llm.llm_service import LLMService
from app.utils.prompts import build_knowledge_prompt
from app.core.auth import get_current_user


router = APIRouter(
    prefix="/knowledge",
    tags=["Streaming"]
)


class StreamRequest(BaseModel):
    topic: str
    level: str = "beginner"

@router.post("/stream")
def stream_knowledge(
    request: StreamRequest,
    user=Depends(get_current_user)
):
    prompt = build_knowledge_prompt(
        request.topic,
        request.level
    )

    def generate():
        # UX trigger for frontend animation
        yield "📖 opening book...\n\n"

        stream = LLMService.stream(prompt)

        for chunk in stream:
            delta = chunk.choices[0].delta
            content = getattr(delta, "content", None)

            if content:
                yield content

    return StreamingResponse(
        generate(),
        media_type="text/plain"
    )    