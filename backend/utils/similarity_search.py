# ==================== embedding_utils.py ====================
"""Embedding and similarity computation utilities."""

from sentence_transformers import SentenceTransformer, util

# Load model once at module level
model = SentenceTransformer('all-MiniLM-L6-v2')


def compute_similarity(resume_text: str, job_text: str) -> float:
    """
    Compute cosine similarity between resume and job description.
    
    Args:
        resume_text: Resume text
        job_text: Job description text
        
    Returns:
        Similarity score (0-100)
    """
    if not resume_text or not job_text:
        return 0.0
    
    # Encode texts
    embeddings = model.encode(
        [resume_text[:2000], job_text[:2000]],
        convert_to_tensor=True,
        show_progress_bar=False
    )
    
    # Compute cosine similarity
    score = util.cos_sim(embeddings[0], embeddings[1]).item()
    
    return round(score * 100, 2)