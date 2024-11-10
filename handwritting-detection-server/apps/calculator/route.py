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
    print(data.image[:100])

    try:
        # Decode the base64 string
        image_data = base64.b64decode(data.image.split(",")[1])
        image = Image.open(BytesIO(image_data))

        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGBA', image.size, (255, 255, 255, 255))
            image = Image.alpha_composite(background, image).convert('RGB')

        
        # Save image to verify its content
        image.save("decoded_image.png")

        # Call analyze_image function
        responses = analyze_image(image, data.dict_of_vars)
        
        result_data = [response for response in responses]
        return {"message": "Image processed", "data": result_data, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))