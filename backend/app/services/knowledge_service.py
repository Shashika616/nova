import json

from app.services.llm.llm_service import LLMService

from app.utils.prompts import build_knowledge_prompt

from app.services.suggestion_service import SuggestionService

from app.db.repository import KnowledgeRepository



class KnowledgeService:


    @staticmethod
    async def generate(
        topic: str,
        level: str,
        user_id: str
    ):


        prompt = build_knowledge_prompt(
            topic,
            level
        )


        response = await LLMService.generate(
            prompt
        )


        try:

            data = json.loads(response)


        except Exception:

            data = {

                "title": topic,

                "content": response,

                "sections": [],

                "suggestions": []

            }



        data["suggestions"] = (
            SuggestionService
            .refine_suggestions(
                data,
                history=[]
            )
        )



        KnowledgeRepository.save_page(
            user_id,
            data
        )


        return data