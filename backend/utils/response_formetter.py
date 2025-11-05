# ==================== response_formatter.py ====================
"""Response formatting utilities for structured API responses.&& File processing utilities for resume extraction. """

from typing import Dict, Any
import pdfplumber
import docx
import re
import tempfile
import os
from fastapi import UploadFile


def extract_and_clean_text(file: UploadFile) -> str:
    """
    Extract text from PDF/DOCX and clean it.
    
    Args:
        file: Uploaded file (PDF or DOCX)
        
    Returns:
        Cleaned text content
        
    Raises:
        ValueError: If file format is unsupported
    """
    suffix = file.filename.split(".")[-1].lower()
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{suffix}") as tmp:
        content = file.file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        text = ""
        
        if suffix == "pdf":
            text = _extract_from_pdf(tmp_path)
        elif suffix == "docx":
            text = _extract_from_docx(tmp_path)
        else:
            raise ValueError(f"Unsupported file format: {suffix}")
        
        # Clean the text
        text = _clean_text(text)
        
        return text
    
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def _extract_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    text_parts = []
    
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    
    return " ".join(text_parts)


def _extract_from_docx(file_path: str) -> str:
    """Extract text from DOCX file."""
    doc = docx.Document(file_path)
    text_parts = [paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()]
    return " ".join(text_parts)


def _clean_text(text: str) -> str:
    """
    Clean extracted text.
    
    Args:
        text: Raw text
        
    Returns:
        Cleaned text
    """
    # Replace multiple whitespaces with single space
    text = re.sub(r'\s+', ' ', text)
    
    # Remove non-ASCII characters (optional - be careful with names)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?@#()-]', ' ', text)
    
    # Remove multiple spaces again
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()


def format_match_response(result: dict, sim_score: float) -> Dict[str, Any]:
    """
    Format resume-job match response with rich structured data.
    
    Args:
        result: AI analysis dictionary from agentic system
        sim_score: Similarity score from embeddings
        
    Returns:
        Formatted response dictionary
    """
    if "error" in result:
        return {
            "type": "match_analysis",
            "status": "error",
            "error": result["error"],
            "similarity_score": sim_score
        }
    
    return {
        "type": "match_analysis",
        "status": "success",
        "similarity_score": sim_score,
        "overall_match_percentage": result.get("overall_match_percentage", "0%"),
        "match_category": _categorize_match(sim_score),
        "selection_probability": result.get("selection_probability", "N/A"),
        
        # Skills Analysis
        "matching_skills": result.get("matching_skills", []),
        "missing_skills": result.get("missing_skills", []),
        "skills_gap_analysis": result.get("skills_gap_analysis", {}),
        
        # Experience & Education
        "experience_match_analysis": result.get("experience_match_analysis", ""),
        "education_match_analysis": result.get("education_match_analysis", ""),
        
        # Recommendations
        "recommendations_for_improvement": result.get("recommendations_for_improvement", []),
        "ats_optimization_suggestions": result.get("ats_optimization_suggestions", []),
        
        # Strengths & Improvements
        "key_strengths": result.get("key_strengths", ""),
        "areas_of_improvement": result.get("areas_of_improvement", ""),
        
        # Metadata (optional detailed analyses)
        "job_analysis": result.get("job_analysis", {}),
        "resume_analysis": result.get("resume_analysis", {})
    }


def format_ats_response(ats_result: dict) -> Dict[str, Any]:
    """
    Format ATS optimization response with structured recommendations.
    
    Args:
        ats_result: ATS analysis dictionary from agentic system
        
    Returns:
        Formatted response dictionary
    """
    if "error" in ats_result:
        return {
            "type": "ats_optimization",
            "status": "error",
            "error": ats_result["error"]
        }
    
    return {
        "type": "ats_optimization",
        "status": "success",
        "ats_score": ats_result.get("ats_score", "N/A"),
        
        # Missing Keywords
        "missing_keywords": ats_result.get("missing_keywords", {}),
        "keyword_density_issues": ats_result.get("keyword_density_issues", []),
        "keyword_recommendations": ats_result.get("keyword_recommendations", {}),
        
        # Formatting & Structure
        "formatting_recommendations": ats_result.get("formatting_recommendations", []),
        "section_organization": ats_result.get("section_organization", []),
        
        # Optimizations
        "optimized_professional_summary": ats_result.get("optimized_professional_summary", ""),
        "priority_action_items": ats_result.get("priority_action_items", []),
        "content_suggestions": ats_result.get("content_suggestions", []),
        
        # Summary
        "improvement_potential": _calculate_improvement_potential(ats_result)
    }


def format_cover_letter(letter_result: dict) -> Dict[str, Any]:
    """
    Format cover letter response with metadata.
    
    Args:
        letter_result: Cover letter dictionary from agentic system
        
    Returns:
        Formatted response dictionary
    """
    if "error" in letter_result:
        return {
            "type": "cover_letter",
            "status": "error",
            "error": letter_result["error"]
        }
    
    cover_letter_text = letter_result.get("cover_letter", "")
    
    return {
        "type": "cover_letter",
        "status": "success",
        "generated_letter": cover_letter_text,
        "word_count": letter_result.get("word_count", len(cover_letter_text.split())),
        "tone": letter_result.get("tone", "professional"),
        
        # Metadata
        "key_highlights": letter_result.get("key_highlights", []),
        "customization_notes": letter_result.get("customization_notes", ""),
        "opening_hook": letter_result.get("opening_hook", ""),
        "call_to_action": letter_result.get("call_to_action", ""),
        
        # Suggestions
        "suggested_improvements": letter_result.get("suggested_improvements", [])
    }


def _categorize_match(score: float) -> str:
    """Categorize match score into descriptive category."""
    if score >= 80:
        return "Excellent Match"
    elif score >= 65:
        return "Good Match"
    elif score >= 50:
        return "Moderate Match"
    else:
        return "Weak Match"


def _calculate_improvement_potential(ats_result: dict) -> str:
    """
    Calculate potential improvement percentage from ATS suggestions.
    
    Args:
        ats_result: ATS analysis dictionary
        
    Returns:
        Improvement potential description
    """
    try:
        # Extract current ATS score
        current_score_str = ats_result.get("ats_score", "0%")
        current_score = int(current_score_str.replace("%", ""))
        
        # Calculate potential based on priority action items
        priority_items = ats_result.get("priority_action_items", [])
        total_improvement = sum(
            int(item.get("estimated_improvement", "0%").replace("%", ""))
            for item in priority_items
            if isinstance(item, dict) and "estimated_improvement" in item
        )
        
        potential_score = min(current_score + total_improvement, 100)
        
        return f"Current: {current_score}% → Potential: {potential_score}% (+{total_improvement}%)"
        
    except (ValueError, AttributeError):
        return "Improvement potential available"


def format_error_response(error_message: str, response_type: str = "general") -> Dict[str, Any]:
    """
    Format error response.
    
    Args:
        error_message: Error message
        response_type: Type of response (match_analysis, ats_optimization, cover_letter)
        
    Returns:
        Formatted error response
    """
    return {
        "type": response_type,
        "status": "error",
        "error": error_message,
        "message": "An error occurred during processing. Please try again."
    }