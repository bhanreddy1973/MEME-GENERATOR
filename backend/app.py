"""
MemeGenius Backend v3 - Semantic Meme Retrieval

Architecture:
- Agent 1 (OCR): Extracts text from all meme images (pre-computed)
- Agent 2 (Sentence Transformer): Encodes user prompt + meme texts into embeddings
- Agent 3 (Retrieval): Finds most semantically similar meme via cosine similarity
- Orchestrator: Combines results, applies re-ranking

Model: sentence-transformers/all-MiniLM-L6-v2 (Hugging Face)
- Trained specifically for semantic text similarity
- 80MB, runs fast on CPU
- No API key needed
"""

import os
import json
import numpy as np
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="MemeGenius API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths - support Render persistent disk or local dev
BASE_DIR = Path(__file__).parent.parent
RENDER_DATA_DIR = Path(os.environ.get("RENDER_DISK_PATH", "/data/memes"))

# Use Render disk if it exists and has data, otherwise fall back to local
if RENDER_DATA_DIR.exists() and any(RENDER_DATA_DIR.iterdir()):
    DATASET_DIR = RENDER_DATA_DIR / "media"
else:
    DATASET_DIR = BASE_DIR / "meme_folder" / "media"

OCR_CACHE_FILE = Path(__file__).parent / "ocr_texts.json"
TEXT_EMBEDDINGS_FILE = Path(__file__).parent / "text_embeddings.npz"

# Global state
sentence_model = None
ocr_texts = {}         # filename -> extracted meme text
ocr_filenames = []     # ordered list of filenames with OCR text
text_embeddings = None  # pre-computed embeddings of OCR texts
all_image_files = []   # all image files in dataset


class GenerateRequest(BaseModel):
    prompt: str
    top_k: Optional[int] = 5


class MemeResponse(BaseModel):
    success: bool
    meme_url: str
    template_name: str
    similarity_score: float
    method: str
    agent_reasoning: str
    meme_text: Optional[str] = None


# ============ SENTENCE TRANSFORMER AGENT ============

def load_sentence_model():
    """Load the sentence-transformers model from Hugging Face."""
    global sentence_model
    try:
        from sentence_transformers import SentenceTransformer
        print("[Model] Loading sentence-transformers/all-MiniLM-L6-v2...")
        sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("[Model] Loaded! (384-dim embeddings)")
        return True
    except Exception as e:
        print(f"[Model] Error: {e}")
        return False


def encode_text(text: str) -> np.ndarray:
    """Encode a single text into an embedding."""
    return sentence_model.encode([text], normalize_embeddings=True)[0]


def encode_texts_batch(texts: list) -> np.ndarray:
    """Encode multiple texts into embeddings."""
    return sentence_model.encode(texts, normalize_embeddings=True, show_progress_bar=True)


# ============ OCR AGENT ============

def load_ocr_data():
    """Load pre-computed OCR text data."""
    global ocr_texts, ocr_filenames
    
    if OCR_CACHE_FILE.exists():
        with open(OCR_CACHE_FILE, 'r') as f:
            ocr_texts = json.load(f)
        ocr_filenames = list(ocr_texts.keys())
        print(f"[OCR] Loaded text for {len(ocr_texts)} memes.")
    else:
        print("[OCR] No cache found. Run: python precompute_ocr.py")
        print("[OCR] The app will still work but with limited matching.")
        ocr_texts = {}
        ocr_filenames = []


def compute_text_embeddings():
    """Pre-compute sentence embeddings for all OCR texts."""
    global text_embeddings
    
    if not ocr_filenames:
        print("[Embeddings] No OCR texts to embed.")
        text_embeddings = None
        return
    
    if TEXT_EMBEDDINGS_FILE.exists():
        data = np.load(TEXT_EMBEDDINGS_FILE)
        cached_size = data['embeddings'].shape[0]
        if cached_size == len(ocr_filenames):
            text_embeddings = data['embeddings']
            print(f"[Embeddings] Loaded cached ({cached_size} vectors).")
            return
        else:
            print(f"[Embeddings] Cache size mismatch ({cached_size} vs {len(ocr_filenames)}). Recomputing...")
    
    print(f"[Embeddings] Computing embeddings for {len(ocr_filenames)} meme texts...")
    texts = [ocr_texts[f] for f in ocr_filenames]
    text_embeddings = encode_texts_batch(texts)
    
    np.savez_compressed(TEXT_EMBEDDINGS_FILE, embeddings=text_embeddings)
    print(f"[Embeddings] Done! Shape: {text_embeddings.shape}")


# ============ RETRIEVAL AGENT ============

def semantic_search(query: str, top_k: int = 5) -> list:
    """Find memes whose OCR text is most similar to the query."""
    if text_embeddings is None or len(ocr_filenames) == 0:
        return []
    
    query_emb = encode_text(query)
    
    # Cosine similarity (embeddings are already normalized)
    similarities = np.dot(text_embeddings, query_emb)
    
    top_idx = np.argsort(similarities)[::-1][:top_k]
    
    results = []
    for idx in top_idx:
        fname = ocr_filenames[idx]
        results.append({
            "filename": fname,
            "score": float(similarities[idx]),
            "meme_text": ocr_texts[fname],
        })
    
    return results


def keyword_search(query: str, top_k: int = 5) -> list:
    """Fallback: word-boundary keyword matching against OCR text."""
    query_lower = query.lower().strip()
    query_words = [w for w in query_lower.split() if len(w) >= 3]  # skip tiny words
    
    if not query_words:
        return []
    
    scores = []
    for fname, text in ocr_texts.items():
        text_words = text.split()
        
        # Only match whole words (not substrings of other words)
        word_set = set(text_words)
        
        # Exact phrase match
        if query_lower in text:
            score = 0.95
        # Whole word overlap
        elif any(qw in word_set for qw in query_words):
            matched = sum(1 for qw in query_words if qw in word_set)
            score = 0.4 + (matched / len(query_words)) * 0.5
        else:
            score = 0.0
        
        if score > 0.3:
            scores.append({"filename": fname, "score": score, "meme_text": text})
    
    scores.sort(key=lambda x: x["score"], reverse=True)
    return scores[:top_k]


# ============ ORCHESTRATOR ============

class Orchestrator:
    """Combines semantic search + keyword fallback."""
    
    def analyze_intent(self, prompt: str) -> dict:
        prompt_lower = prompt.lower()
        intent = {"emotion": "neutral", "topic": "general", "is_question": "?" in prompt}
        
        emotion_map = {
            "happy": ["happy", "joy", "lol", "funny", "haha", "great", "amazing", "love", "nice", "good"],
            "sad": ["sad", "cry", "depressed", "tired", "done", "pain", "suffering", "lonely"],
            "angry": ["angry", "rage", "hate", "wtf", "annoyed", "mad", "furious", "stupid"],
            "surprised": ["surprised", "shocked", "omg", "what", "wait", "unexpected", "wow"],
            "sarcastic": ["sure", "right", "totally", "obviously", "fine", "thanks", "great job"],
        }
        
        topic_map = {
            "coding": ["code", "programming", "developer", "bug", "compile", "python", "javascript", "stackoverflow"],
            "work": ["boss", "meeting", "deadline", "office", "work", "job", "email", "monday", "salary"],
            "school": ["exam", "homework", "teacher", "student", "class", "study", "grade", "professor"],
            "relationship": ["girlfriend", "boyfriend", "crush", "love", "date", "ex", "married"],
            "gaming": ["game", "gaming", "player", "fps", "lag", "noob", "fortnite"],
            "food": ["food", "eat", "hungry", "pizza", "cooking", "dinner", "lunch"],
            "internet": ["wifi", "internet", "loading", "buffer", "download", "phone", "social media"],
        }
        
        for emotion, kws in emotion_map.items():
            if any(kw in prompt_lower for kw in kws):
                intent["emotion"] = emotion
                break
        
        for topic, kws in topic_map.items():
            if any(kw in prompt_lower for kw in kws):
                intent["topic"] = topic
                break
        
        return intent
    
    def process(self, prompt: str, top_k: int = 5) -> dict:
        intent = self.analyze_intent(prompt)
        
        # Strategy 1: Semantic search with augmented prompts
        search_prompts = [prompt]
        if len(prompt.split()) <= 3:
            search_prompts.append(f"meme about {prompt}")
            search_prompts.append(f"when {prompt}")
        if intent["topic"] != "general":
            search_prompts.append(f"{intent['topic']} meme {prompt}")
        
        # Collect results from all prompts
        all_results = {}
        for sp in search_prompts:
            results = semantic_search(sp, top_k=3)
            for r in results:
                fname = r["filename"]
                if fname not in all_results or r["score"] > all_results[fname]["score"]:
                    all_results[fname] = r
        
        # Strategy 2: Keyword fallback
        kw_results = keyword_search(prompt, top_k=3)
        for r in kw_results:
            fname = r["filename"]
            # Boost keyword matches
            boosted_score = r["score"] * 1.2
            if fname not in all_results or boosted_score > all_results[fname]["score"]:
                all_results[fname] = {**r, "score": boosted_score}
        
        # Sort and return best
        sorted_results = sorted(all_results.values(), key=lambda x: x["score"], reverse=True)
        
        if not sorted_results or sorted_results[0]["score"] < 0.25:
            # Low confidence - tell user to be more specific
            best_available = sorted_results[0] if sorted_results else None
            if best_available:
                return {
                    "success": True,
                    "filename": best_available["filename"],
                    "score": best_available["score"],
                    "method": "low_confidence",
                    "reasoning": f"Low match confidence ({best_available['score']:.2f}). Try more specific prompts like 'exam stress', 'waiting for food', 'programming bug'. Only {len(ocr_texts)}/2421 memes are indexed so far.",
                    "meme_text": best_available.get("meme_text", ""),
                }
            else:
                import random
                fname = random.choice(all_image_files) if all_image_files else "not_found.jpg"
                return {
                    "success": True,
                    "filename": fname,
                    "score": 0.0,
                    "method": "no_match",
                    "reasoning": f"No matching meme found for '{prompt}'. Try: 'spaghetti', 'what scares you', 'programming'. Only {len(ocr_texts)}/2421 memes indexed.",
                    "meme_text": "",
                }
        
        best = sorted_results[0]
        
        # Determine method used
        method = "semantic_search"
        if best["score"] > 0.9:
            method = "keyword_exact_match"
        
        reasoning = (
            f"Intent: {intent['emotion']}/{intent['topic']}. "
            f"Score: {best['score']:.3f}. Method: {method}. "
            f"Searched {len(search_prompts)} augmented queries. "
            f"Meme text: \"{best.get('meme_text', '')[:80]}...\""
        )
        
        return {
            "success": True,
            "filename": best["filename"],
            "score": best["score"],
            "method": method,
            "reasoning": reasoning,
            "meme_text": best.get("meme_text", ""),
        }


orchestrator = Orchestrator()


# ============ API ============

@app.on_event("startup")
async def startup():
    global all_image_files
    
    print("=" * 55)
    print("  MemeGenius v3 - Sentence Transformer + OCR Retrieval")
    print("  Model: sentence-transformers/all-MiniLM-L6-v2")
    print("=" * 55)
    
    if not DATASET_DIR.exists():
        print(f"ERROR: Dataset not found at {DATASET_DIR}")
        return
    
    all_image_files = sorted([
        f for f in os.listdir(DATASET_DIR)
        if f.lower().endswith(('.jpg', '.jpeg', '.png'))
    ])
    print(f"[Dataset] {len(all_image_files)} images found.")
    
    # Load model
    load_sentence_model()
    
    # Load OCR data
    load_ocr_data()
    
    # Compute/load text embeddings
    compute_text_embeddings()
    
    print(f"\n{'=' * 55}")
    print(f"  READY! Images: {len(all_image_files)}, OCR indexed: {len(ocr_texts)}")
    print(f"{'=' * 55}\n")


@app.get("/")
async def root():
    return {
        "name": "MemeGenius API",
        "version": "3.0.0",
        "model": "sentence-transformers/all-MiniLM-L6-v2",
        "architecture": "OCR + Sentence Transformer + Semantic Retrieval",
        "dataset_images": len(all_image_files),
        "ocr_indexed": len(ocr_texts),
    }


@app.post("/generate", response_model=MemeResponse)
async def generate_meme(request: GenerateRequest):
    if sentence_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet.")
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    
    result = orchestrator.process(prompt=request.prompt, top_k=request.top_k or 5)
    
    return MemeResponse(
        success=True,
        meme_url=f"/memes/{result['filename']}",
        template_name=result["filename"].split("_main_")[0] if "_main_" in result["filename"] else result["filename"],
        similarity_score=result["score"],
        method=result["method"],
        agent_reasoning=result["reasoning"],
        meme_text=result.get("meme_text", ""),
    )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": sentence_model is not None,
        "model_name": "all-MiniLM-L6-v2",
        "dataset_images": len(all_image_files),
        "ocr_indexed": len(ocr_texts),
        "embeddings_ready": text_embeddings is not None,
    }


# Serve meme images
app.mount("/memes", StaticFiles(directory=str(DATASET_DIR)), name="memes")
