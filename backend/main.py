from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
import asyncio
from services import AIService

load_dotenv()

app = FastAPI(title="Mind Matrix")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()

@app.get("/")
async def root():
    return {"message": "Mind Matrix API is running"}

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    chat_history = []
    
    try:
        while True:
            # Receive user input
            user_input = await websocket.receive_text()
            
            # Store user message
            chat_history.append({"role": "user", "content": user_input})
            
            # Get response from AI Service (Grok)
            response_generator = await ai_service.get_grok_response(user_input, chat_history[:-1])
            
            if response_generator:
                full_response = ""
                # Stream the response chunk by chunk to the client
                async for chunk in response_generator:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        full_response += content
                        # Sending chunks might be too much for this simple frontend setup which expects full messages
                        # But let's try sending the full message at the end for now to match App.jsx expectation
                        # Or we could change App.jsx to handle stream. 
                        # Given App.jsx: setMessages((prev) => [...prev, { role: 'assistant', content: event.data }]);
                        # It appends a NEW message for every event. So streaming chunks would create many small messages.
                        # We should buffer and send once, OR refactor frontend.
                        # For now, buffer and send once.
                
                await websocket.send_text(full_response)
                chat_history.append({"role": "assistant", "content": full_response})
            else:
                 await websocket.send_text("Sorry, I couldn't generate a response.")

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error in websocket: {e}")
        try:
             await websocket.close()
        except:
            pass

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
