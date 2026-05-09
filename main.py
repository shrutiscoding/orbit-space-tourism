import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import time

app = FastAPI(title="ORBIT Space Tourism API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Destination(BaseModel):
    id: int
    name: str
    description: str
    travel_duration: str
    ticket_price: str
    image_url: str

class ReservationRequest(BaseModel):
    passenger_name: str
    email: EmailStr
    destination_id: int
    package_type: str

class ContactSubmission(BaseModel):
    name: str
    email: EmailStr
    message: str

class ChatRequest(BaseModel):
    message: str

# Data
DESTINATIONS = [
    {
        "id": 1,
        "name": "Lunar Gateway Resort",
        "description": "Experience luxury on the moon with stunning views of Earth and low-gravity spa treatments.",
        "travel_duration": "3 Days",
        "ticket_price": "$250,000",
        "image_url": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "id": 2,
        "name": "Mars Horizon Colony",
        "description": "The red planet awaits. Explore Valles Marineris and stay in our state-of-the-art bio-domes.",
        "travel_duration": "6 Months",
        "ticket_price": "$1,500,000",
        "image_url": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "id": 3,
        "name": "Europa Ocean Retreat",
        "description": "Dive deep beneath the icy crust of Jupiter's moon Europa into our sub-surface luxury suites.",
        "travel_duration": "2 Years",
        "ticket_price": "$5,000,000",
        "image_url": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=2000"
    },
    {
        "id": 4,
        "name": "Saturn Ring Cruise",
        "description": "A breathtaking journey through the majestic rings of Saturn aboard the SS Infinity.",
        "travel_duration": "4 Years",
        "ticket_price": "$12,000,000",
        "image_url": "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "id": 5,
        "name": "Orbital Zero-Gravity Hotel",
        "description": "The ultimate weekend getaway. Floating 400km above Earth with panoramic views.",
        "travel_duration": "1 Day",
        "ticket_price": "$50,000",
        "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000"
    }
]

MISSIONS = [
    {
        "id": 101,
        "name": "Artemis XI",
        "spacecraft": "Orion-Luxury-X",
        "launch_date": "2026-10-15",
        "status": "On Schedule",
        "availability": "4 Seats"
    },
    {
        "id": 102,
        "name": "Ares Vanguard",
        "spacecraft": "Starship-Horizon",
        "launch_date": "2027-01-20",
        "status": "Pre-flight Check",
        "availability": "12 Seats"
    },
    {
        "id": 103,
        "name": "Jovian Explorer",
        "spacecraft": "Europa-1-Clipper",
        "launch_date": "2027-05-12",
        "status": "Assembly",
        "availability": "Limited"
    }
]

# Endpoints
@app.get("/destinations")
async def get_destinations():
    return DESTINATIONS

@app.get("/missions")
async def get_missions():
    return MISSIONS

@app.post("/reserve-trip")
async def reserve_trip(request: ReservationRequest):
    await asyncio.sleep(2)
    return {"status": "success", "message": "Reservation Confirmed", "reservation_id": f"ORB-{int(time.time())}"}

@app.post("/contact-submit")
async def contact_submit(submission: ContactSubmission):
    return {"status": "success", "message": f"Thank you, {submission.name}. Our flight coordinators will reach out shortly."}

@app.post("/chat")
async def chat(request: ChatRequest):
    msg = request.message.lower()
    
    if "mars" in msg:
        response = "Our Mars Horizon journey offers panoramic dome suites, low-gravity wellness experiences, and guided exploration tours across the crimson valleys."
    elif "safety" in msg:
        response = "All orbital missions are conducted with next-generation aerospace safety systems and AI-assisted navigation protocols."
    elif "moon" in msg or "lunar" in msg:
        response = "The Lunar Gateway Resort features Earth-view observation decks and exclusive lunar surface excursions."
    elif "price" in msg or "cost" in msg:
        response = "Our orbital packages range from $50,000 for low-Earth orbit to $12,000,000 for Saturn expeditions. Financing is available through Galactic Credit."
    elif "hello" in msg or "hi" in msg:
        response = "Welcome to ORBIT Concierge. How may I assist your journey across the stars today?"
    else:
        response = "I am ORBIT AI, your luxury space travel assistant. I can provide details on destinations, safety protocols, and upcoming mission schedules."
    
    return {"reply": response}

# Mount static files (this must be last to not override API routes)
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
