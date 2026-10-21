from datetime import datetime , timezone
from typing import Literal , Optional 
from pydantic import BaseModel , Field
class LocationSchema(BaseModel):
    latitude:float 
    longitude : float
    area:Literal["Bandra East ", " Bandra West"]
    address:Optional[str]= None

class AIResultSchema(BaseModel):
    category:str = "Not Analyzed"
    confidence :float = Field(default=0.0,ge=0.0 le=1.0)
    severity :Literal["Low","Medium","High"] = "Medium"
    isDuplicate : bool = False
    duplicateComplaintId:Optional[str] = None

class ComplaintSceham(ComplaintCreateSchema):
    image:Optional[str]=None
    ai:AIResultSchema = Field(default_factory=AIResultSchema)
    status:Literal[
        "Pending"
        "Assigned"
        "In Progress"
        "Resolved"
        "Closed"

    ]="Pending"

    createdAt :datetime = Field(
        default_factory=lambda:datetime.now(timezone.utc)

    )
    updatedAt:datetime = Field(
        default_factory=lambda:datetime.now(timezone.utc)
    )

    updatedAt:datetime= Field(
        default_factory=lambda:datetime.now(timezone.utc)
    )
    
