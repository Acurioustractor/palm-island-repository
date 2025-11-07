"""
Embedding generation service using Sentence Transformers
"""
import os
from typing import List, Union
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

# Global model instance (loaded once)
_model = None

def get_embedding_model():
    """Get or load the embedding model (singleton pattern)"""
    global _model

    if _model is None:
        model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        print(f"📥 Loading embedding model: {model_name}")
        _model = SentenceTransformer(model_name)
        print(f"✅ Model loaded successfully")

    return _model

def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding for a single text

    Args:
        text: Text to embed

    Returns:
        List of floats (embedding vector)
    """
    model = get_embedding_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()

def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts (more efficient)

    Args:
        texts: List of texts to embed

    Returns:
        List of embedding vectors
    """
    model = get_embedding_model()
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)
    return embeddings.tolist()

def generate_story_embedding(title: str, content: str) -> List[float]:
    """
    Generate embedding for a story by combining title and content

    Args:
        title: Story title
        content: Story content

    Returns:
        Embedding vector
    """
    # Combine title (weighted more) with content
    # Title appears 3 times to give it more weight in the embedding
    combined_text = f"{title}. {title}. {title}. {content}"

    return generate_embedding(combined_text)
