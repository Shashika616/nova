from app.services.llm.groq_client import client


class LLMService:


    @staticmethod
    async def generate(prompt: str):

        response = client.chat.completions.create(

            model="llama-3.1-8b-instant",

            messages=[

                {
                    "role": "system",
                    "content":
                    "You are NOVA, an encyclopedia AI."
                },

                {
                    "role": "user",
                    "content": prompt
                }

            ],

            temperature=0.6,

            max_tokens=2000
        )


        return response.choices[0].message.content



    @staticmethod
    def stream(prompt: str):

        response = client.chat.completions.create(

            model="llama-3.1-8b-instant",

            messages=[

                {
                    "role": "system",
                    "content":
                    "You are NOVA, an encyclopedia AI."
                },

                {
                    "role": "user",
                    "content": prompt
                }

            ],

            temperature=0.6,

            max_tokens=2000,

            stream=True

        )


        return response