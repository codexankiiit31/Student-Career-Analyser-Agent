import json
from pathlib import Path
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from utils.llm_utils import get_llm


class CareerAgent:
    """AI Career Agent for resume analysis and optimization with agentic capabilities."""
    
    def __init__(self):
        """Initialize the career agent with LLM."""
        self.llm = get_llm()
        self.output_parser = StrOutputParser()
        self.prompts_dir = Path(__file__).resolve().parent.parent / "prompts"
        print("✅ CareerAgent initialized successfully")
    
    def _load_prompt(self, file_name: str) -> str:
        """
        Load prompt template from file.
        
        Args:
            file_name: Name of the prompt file
            
        Returns:
            Prompt template string
        """
        prompt_path = self.prompts_dir / file_name
        
        if not prompt_path.exists():
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    
    def _clean_json_response(self, response_text: str) -> str:
        """
        Clean and prepare JSON response for parsing.
        
        Args:
            response_text: Raw LLM response
            
        Returns:
            Cleaned JSON string
        """
        # Strip whitespace and quotes
        response_text = response_text.strip().strip('"\'')
        
        # Remove markdown code blocks
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        elif response_text.startswith('```'):
            response_text = response_text.replace('```', '').strip()
        
        return response_text
    
    def _analyze_job_description(self, job_description: str) -> dict:
        """
        Deep analysis of job description using agentic approach.
        
        Args:
            job_description: Job description text
            
        Returns:
            Structured job analysis
        """
        prompt_template = self._load_prompt("job_analysis_prompt.txt")

        try:
            response = self.llm.invoke(prompt_template.format(description=job_description[:3000]))
            response_text = response.content if hasattr(response, 'content') else str(response)
            
            print(f"📥 Job analysis response received: {response_text[:200]}...")
            
            response_text = self._clean_json_response(response_text)
            parsed_response = json.loads(response_text)
            
            print("✅ Job description analysis successful!")
            return parsed_response
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error in job analysis: {e}")
            print(f"Debug - Response: {response_text[:500]}")
            return {}
        except Exception as e:
            print(f"❌ Error analyzing job description: {str(e)}")
            return {}
    
    def _analyze_resume_content(self, resume_text: str) -> dict:
        """
        Deep analysis of resume using agentic approach.
        
        Args:
            resume_text: Resume content
            
        Returns:
            Structured resume analysis
        """
        prompt_template = self._load_prompt("resume_analysis_prompt.txt")

        try:
            response = self.llm.invoke(prompt_template.format(resume=resume_text[:4000]))
            response_text = response.content if hasattr(response, 'content') else str(response)
            
            print(f"📥 Resume analysis response received: {response_text[:200]}...")
            
            response_text = self._clean_json_response(response_text)
            parsed_response = json.loads(response_text)
            
            print("✅ Resume analysis successful!")
            return parsed_response
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error in resume analysis: {e}")
            print(f"Debug - Response: {response_text[:500]}")
            return {}
        except Exception as e:
            print(f"❌ Error analyzing resume: {str(e)}")
            return {}
    
    def match_resume_job(self, resume_text: str, job_description: str, sim_score: float) -> dict:
        """
        Analyze resume-job match using agentic multi-step approach.
        
        Args:
            resume_text: Extracted resume text
            job_description: Job description text
            sim_score: Similarity score from embeddings
            
        Returns:
            Detailed matching analysis with structured data
        """
        print("🔍 Starting agentic match analysis...")
        
        # Step 1: Analyze job description
        job_analysis = self._analyze_job_description(job_description)
        if not job_analysis:
            return {"error": "Failed to analyze job description"}
        
        # Step 2: Analyze resume
        resume_analysis = self._analyze_resume_content(resume_text)
        if not resume_analysis:
            return {"error": "Failed to analyze resume"}
        
        # Step 3: Perform detailed matching
        prompt_template = self._load_prompt("match_analysis_prompt.txt")

        try:
            response = self.llm.invoke(prompt_template.format(
                job=json.dumps(job_analysis, indent=2)[:2000],
                resume=json.dumps(resume_analysis, indent=2)[:2000],
                similarity=sim_score
            ))
            response_text = response.content if hasattr(response, 'content') else str(response)
            
            print(f"📥 Match analysis response received: {response_text[:200]}...")
            
            response_text = self._clean_json_response(response_text)
            match_result = json.loads(response_text)
            
            # Add metadata
            match_result['job_analysis'] = job_analysis
            match_result['resume_analysis'] = resume_analysis
            
            print(f"✅ Match analysis complete! Score: {match_result.get('overall_match_percentage', 'Unknown')}")
            return match_result
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error in match analysis: {e}")
            print(f"Debug - Response: {response_text[:500]}")
            return {"error": "Failed to parse match analysis"}
        except Exception as e:
            print(f"❌ Error in match analysis: {str(e)}")
            return {"error": str(e)}
    
    def ats_optimization(self, resume_text: str, job_description: str) -> dict:
        """
        Provide comprehensive ATS optimization with structured recommendations.
        
        Args:
            resume_text: Extracted resume text
            job_description: Job description text
            
        Returns:
            Structured ATS optimization recommendations
        """
        print("🔍 Starting ATS optimization analysis...")
        
        prompt_template = self._load_prompt("ats_optimization_prompt.txt")

        try:
            response = self.llm.invoke(prompt_template.format(
                resume=resume_text[:4000],
                job=job_description[:2000]
            ))
            response_text = response.content if hasattr(response, 'content') else str(response)
            
            print(f"📥 ATS optimization response received: {response_text[:200]}...")
            
            response_text = self._clean_json_response(response_text)
            ats_result = json.loads(response_text)
            
            print(f"✅ ATS optimization complete! Score: {ats_result.get('ats_score', 'Unknown')}")
            return ats_result
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error in ATS optimization: {e}")
            print(f"Debug - Response: {response_text[:500]}")
            return {"error": "Failed to parse ATS optimization"}
        except Exception as e:
            print(f"❌ Error in ATS optimization: {str(e)}")
            return {"error": str(e)}
    
    def generate_cover_letter(self, resume_text: str, job_description: str) -> dict:
        """
        Generate a professional, tailored cover letter with metadata.
        
        Args:
            resume_text: Extracted resume text
            job_description: Job description text
            
        Returns:
            Generated cover letter with metadata
        """
        print("🔍 Generating cover letter...")
        
        prompt_template = self._load_prompt("cover_letter_generation_prompt.txt")

        try:
            response = self.llm.invoke(prompt_template.format(
                resume=resume_text[:4000],
                job=job_description[:2000]
            ))
            response_text = response.content if hasattr(response, 'content') else str(response)
            
            print(f"📥 Cover letter response received: {response_text[:200]}...")
            
            response_text = self._clean_json_response(response_text)
            letter_result = json.loads(response_text)
            
            print(f"✅ Cover letter generated! Word count: {letter_result.get('word_count', 'Unknown')}")
            return letter_result
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error in cover letter generation: {e}")
            print(f"Debug - Response: {response_text[:500]}")
            return {"error": "Failed to parse cover letter"}
        except Exception as e:
            print(f"❌ Error generating cover letter: {str(e)}")
            return {"error": str(e)}