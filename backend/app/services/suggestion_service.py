class SuggestionService:

    @staticmethod
    def refine_suggestions(llm_output: dict, history: list):

        suggestions = llm_output.get("suggestions", [])

        # future: filter duplicates using history
        filtered = [
            s for s in suggestions
            if s.lower() not in [h.lower() for h in history]
        ]

        return filtered