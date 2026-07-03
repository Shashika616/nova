from app.db.supabase import supabase


class KnowledgeRepository:

    @staticmethod
    def save_page(user_id, data):

        return supabase.table("knowledge_pages").insert({
            "user_id": user_id,
            "topic": data["title"],
            "title": data["title"],
            "content": data["content"],
            "sections": data.get("sections", []),
            "suggestions": data.get("suggestions", [])
        }).execute()