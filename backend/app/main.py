from fastapi import FastAPI


from app.api.routes import knowledge
from app.api.routes import stream
from app.api.routes import auth
from app.middleware.cors import setup_cors



app = FastAPI(
    title="NOVA Encyclopedia API"
)

setup_cors(app)

app.include_router(
    auth.router
)



app.include_router(
    knowledge.router
)



app.include_router(
    stream.router
)



@app.get("/health")
def health():

    return {

        "status":"ok"

    }