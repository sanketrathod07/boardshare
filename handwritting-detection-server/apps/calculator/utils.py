import google.generativeai as genai
import ast
import json
from PIL import Image
from constants import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

def analyze_image(img: Image, dict_of_vars: dict):
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    dict_of_vars_str = json.dumps(dict_of_vars, ensure_ascii=False)
    prompt = (
    f"You are an AI calculator designed to interpret and solve mathematical expressions, equations, and visual math problems directly. "
    f"Please analyze and return answers only for mathematical expressions, calculations, or equations. If the image content is unrelated to mathematics, "
    f"or if you cannot derive a clear mathematical question from it, respond exactly with 'Not a mathematical expression'. "
    f"Do not provide any additional information or explanations. "
    f"Please strictly follow these rules and interpret each problem as follows: "
    f"1. **Simple Expressions and Calculations**: Evaluate expressions like 2 + 2, 3 * 4, 5 / 6, 7 - 8, etc., and return the answer as a LIST OF ONE DICT: [{{'expr': expression, 'result': answer}}]. "
    f"2. **Equations with Variables**: Solve equations like x^2 + 2x + 1 = 0, 3y + 4x = 0, for variables. Return a COMMA-SEPARATED LIST OF DICTS for each variable's solution: [{{'expr': 'x', 'result': solution_x}}, {{'expr': 'y', 'result': solution_y}}]. "
    f"3. **Assignment Statements**: If there are variable assignments like x = 4, y = 5, return each assignment in a DICT with 'assign': True: [{{'expr': 'x', 'result': 4, 'assign': True}}]. "
    f"4. **Graphical Problems with Mathematical Context**: Analyze diagrams or visual problems such as triangles for Pythagorean theorem, distances in trigonometric problems, or bar charts for statistical values. Return these as [{{'expr': expression, 'result': calculated answer}}]. "
    f"5. **Abstract Concepts or Non-Mathematical Drawings**: If the image suggests non-mathematical themes (like emotions, historical references), respond as [{{'expr': 'Not a mathematical expression', 'result': 'Not Applicable'}}]. "
    f"Use the following dictionary of user-defined variables to interpret expressions accurately: {dict_of_vars_str}. "
    f"Return each answer with correct JSON format, quoting all keys and values for seamless parsing with Python's ast.literal_eval. "
)
    
    response = model.generate_content([prompt, img])
    response_text = response.text.strip()
    
    print("Raw response:", response_text)
    
    # Check if the response matches expected patterns
    try:
        if response_text == "Not a mathematical expression":
            return [{"expr": "Not a mathematical expression", "result": "Not Applicable"}]
        
        # Attempt to parse response for mathematical results
        answers = ast.literal_eval(response_text)
        if isinstance(answers, list) and all("result" in item for item in answers):
            return answers
        else:
            # Fallback response if parsing fails or unexpected content is returned
            return [{"expr": "Not a mathematical expression", "result": "Not Applicable"}]
    except Exception as e:
        print(f"Error in parsing response from Gemini API: {e}")
        return [{"expr": "Not a mathematical expression", "result": None}]
