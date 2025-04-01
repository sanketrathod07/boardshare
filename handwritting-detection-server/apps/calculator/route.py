from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from io import BytesIO
from apps.calculator.utils import analyze_image
from PIL import Image
from schema import ImageData
import base64

router = APIRouter()

@router.post("")
async def run(data: ImageData):
    print("Incoming data (truncated):", data.image[:100])  # Log incoming data for debugging

    try:
        # Decode the base64 string
        image_data = base64.b64decode(data.image.split(",")[1])
        image = Image.open(BytesIO(image_data))

        # Handle transparent images
        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGBA', image.size, (255, 255, 255, 255))
            image = Image.alpha_composite(background, image).convert('RGB')

        # Save image locally for verification
        image.save("decoded_image.png")
        print("Image saved successfully for verification.")

        # Analyze the image
        responses = analyze_image(image, data.dict_of_vars)
        print("API responses:", responses)

        # Prepare and return results
        result_data = [response for response in responses]
        return {"message": "Image processed", "data": result_data, "status": "success"}
    except Exception as e:
        print(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
