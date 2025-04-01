import google.generativeai as genai
import json
import re
from PIL import Image
from constants import GEMINI_API_KEY

# Configure the Gemini API
genai.configure(api_key=GEMINI_API_KEY)

def sanitize_response(response_text):
    """
    Sanitize the raw API response to extract valid JSON content.
    """
    # Remove markdown-style code block formatting
    clean_text = response_text.strip("```").strip()
    
    # Replace single quotes with double quotes for JSON compatibility
    clean_text = clean_text.replace("'", '"')
    
    # Extract JSON-like content if it is surrounded by extra formatting
    json_match = re.search(r"\[.*\]", clean_text)
    if json_match:
        return json_match.group(0)  # Return the JSON-like content
    # Fallback response
    return '[{"expr": "Not a mathematical expression", "result": "Not Applicable"}]'

def analyze_image(img: Image, dict_of_vars: dict):
    """
    Process an image to analyze mathematical expressions using the Gemini API.
    """
    # Prepare the prompt with strict rules for response formatting
    dict_of_vars_str = json.dumps(dict_of_vars, ensure_ascii=False)
    prompt = (
        f"You are an AI calculator designed to analyze and solve mathematical expressions, equations, or calculations. "
        f"Your response must strictly adhere to the following JSON format:\n"
        f"1. For valid mathematical expressions or calculations: [{{'expr': 'expression', 'result': 'answer'}}].\n"
        f"2. For invalid or non-mathematical expressions: [{{'expr': 'Not a mathematical expression', 'result': 'Not Applicable'}}].\n"
        f"Do not include any explanations, HTML tags, or additional formatting in your response.\n"
        f"Analyze the provided input and return the result as per these rules. "
        f"Use the following dictionary of user-defined variables for interpretation: {dict_of_vars_str}."
    )
    
    try:
        # Generate content using the Gemini API
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = model.generate_content([prompt, img])
        
        # Log raw response
        response_text = response.text.strip()
        print("Raw API response:", repr(response_text))
        
        # Sanitize the response to ensure valid JSON parsing
        sanitized_response = sanitize_response(response_text)
        
        # Parse the sanitized response
        answers = json.loads(sanitized_response)
        print("Parsed answers:", answers)
        
        return answers
    except json.JSONDecodeError as e:
        # Handle JSON parsing errors gracefully
        print(f"Error parsing JSON response: {e}")
        return [{"expr": "Not a mathematical expression", "result": None}]
    except Exception as e:
        # Handle unexpected errors
        print(f"Error in analyze_image: {e}")
        return [{"expr": "Not a mathematical expression", "result": None}]