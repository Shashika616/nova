from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.knowledge_service import KnowledgeService
from app.core.auth import get_current_user



router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge"]
)



class RequestModel(BaseModel):

    topic: str

    level: str = "beginner"



@router.post("/generate")
async def generate(
    req: RequestModel,
    user=Depends(get_current_user)
):


    result = await KnowledgeService.generate(

        topic=req.topic,

        level=req.level,

        user_id=user.id
    )


    return result