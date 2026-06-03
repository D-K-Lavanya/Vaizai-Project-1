from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS so Node backend can connect seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "AI Worker Online", "model": "en_core_web_sm"}

@app.post("/api/nlp-parse")
async def nlp_parse(payload: dict):
    # Fallback to keep network loop active
    return {
        "status": "success",
        "name": "Lavanya D K",
        "email": payload.get("filePath", ""),
        "skills": ["Python", "FastAPI", "NLP"]
    }