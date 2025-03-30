import json
import requests
import time
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCkG1VdR93aeUt8Es728Zb0PQydBvcXa6U")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

class FetchAIGeminiAgent:
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.conversation_history = []
        self.system_prompt = f"""
        You are {name}, an AI assistant. {description}
        Always respond in detailed.
        """

    def get_gemini_response(self, user_message: str) -> str:
        """Get a response from the Gemini API"""
        self.conversation_history.append({"role": "user", "content": user_message})
        full_prompt = self.system_prompt + "\n\n"
        for message in self.conversation_history[-10:]:
            full_prompt += f"{message['role'].capitalize()}: {message['content']}\n"

        try:
            response = requests.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                data=json.dumps({"contents": [{"parts": [{"text": full_prompt}]}]})
            )
            data = response.json()
            if "candidates" in data and data["candidates"]:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                self.conversation_history.append({"role": "agent", "content": text})
                return text
            return "No response from Gemini API."
        except Exception as e:
            return f"Error: {str(e)}"

    def connect_to_fetch_network(self, network_url: str):
        """Simulate connecting to the Fetch.ai network"""
        print(f"Connecting to Fetch.ai network at {network_url}...")
        time.sleep(1)  # Simulated connection delay
        print(f"Agent {self.name} successfully connected to Fetch.ai network.")
        return True

# Create Flask web application
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Instantiate the agent
agent = FetchAIGeminiAgent(
    name="FetchGeminiAgent",
    description="I am an AI-powered financial assistant running on the Fetch.ai network. I analyze real-time transaction data, provide financial insights, answer queries, and generate interactive expenditure breakdowns."
)

# Simulate connecting to the Fetch.ai network
agent.connect_to_fetch_network("https://network.fetch.ai")

# Define a simple index route
@app.route("/", methods=["GET"])
def index():
    return "Welcome to the Fetch.ai Gemini Agent API. Use the /api/chat endpoint to interact with the agent."

# Define the chat API endpoint
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
    
    # Get response from the agent
    response_text = agent.get_gemini_response(user_message)
    
    return jsonify({"response": response_text})

if __name__ == "__main__":
    # Get port from environment variable or use default
    # Run the Flask app
    app.run( port=5010, debug=True)

