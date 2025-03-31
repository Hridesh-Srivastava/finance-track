import json
import requests
import time
import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import Firebase modules (will only be used if Firebase is available)
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    print("Firebase modules not available. Running without Firebase integration.")

# Configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCkG1VdR93aeUt8Es728Zb0PQydBvcXa6U")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

class FetchAIGeminiAgent:
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.conversation_history = []
        self.transaction_data = []
        self.last_refresh = None
        self.system_prompt = f"""
        You are {name}, an AI assistant. {description}
        """
        
        # Initialize Firebase if available
        self.db = None
        if FIREBASE_AVAILABLE:
            try:
                # Check if Firebase is already initialized
                if not firebase_admin._apps:
                    # Try to initialize with the service account file
                    try:
                        cred = credentials.Certificate("blinkbank-4c28c-firebase-adminsdk-fbsvc-1b4a55a273.json")
                        firebase_admin.initialize_app(cred)
                    except Exception as e:
                        print(f"Error initializing Firebase with credentials: {e}")
                        print("Attempting to initialize Firebase with default credentials...")
                        firebase_admin.initialize_app()
                
                self.db = firestore.client()
                print("Firebase Firestore initialized successfully")
            except Exception as e:
                print(f"Failed to initialize Firebase: {e}")

    def refresh_transactions(self):
        """Fetch latest transactions from Firestore if available"""
        if not self.db or not FIREBASE_AVAILABLE:
            return
            
        if not self.last_refresh or (time.time() - self.last_refresh) > 300:  # Refresh every 5 minutes
            print("🔄 Refreshing transaction data from Firebase...")
            try:
                docs = self.db.collection("transactions").stream()
                self.transaction_data = [doc.to_dict() for doc in docs]
                self.last_refresh = time.time()
                print(f"✅ Loaded {len(self.transaction_data)} transactions from Firebase")
            except Exception as e:
                print(f"Error fetching transactions: {e}")

    def analyze_transactions(self):
        """Generate enhanced data summary if transaction data is available"""
        if not self.transaction_data:
            return ""
            
        summary = {
            "total_income": 0,
            "total_expenses": 0,
            "categories": {},
            "users": set(),
            "recent": []
        }

        for t in self.transaction_data:
            if t.get('type', '').lower() == 'income':
                summary["total_income"] += t.get('amount', 0)
            else:
                summary["total_expenses"] += t.get('amount', 0)
            
            category = t.get('category', 'uncategorized')
            summary["categories"][category] = summary["categories"].get(category, 0) + t.get('amount', 0)
            
            summary["users"].add(t.get('userId', 'unknown'))
            
            if len(summary["recent"]) < 5:
                summary["recent"].append({
                    "date": t.get('date', 'unknown'),
                    "amount": t.get('amount', 0),
                    "category": category,
                    "type": t.get('type', 'unknown')
                })

        return f"""
        Financial Snapshot:
        - Total Income: ${summary['total_income']}
        - Total Expenses: ${summary['total_expenses']}
        - Net Balance: ${summary['total_income'] - summary['total_expenses']}
        - Top Categories: {json.dumps(summary['categories'], indent=2)}
        - Active Users: {len(summary['users'])}
        - Recent Transactions: {json.dumps(summary['recent'], indent=2)}
        """

    def save_conversation(self, user_id, user_message, ai_response):
        """Save conversation to Firebase if available"""
        if not self.db or not FIREBASE_AVAILABLE:
            return
            
        try:
            # Create a conversation document
            conversation_ref = self.db.collection("conversations").document()
            conversation_ref.set({
                "userId": user_id,
                "userMessage": user_message,
                "aiResponse": ai_response,
                "timestamp": firestore.SERVER_TIMESTAMP
            })
            print(f"Conversation saved to Firebase with ID: {conversation_ref.id}")
        except Exception as e:
            print(f"Error saving conversation to Firebase: {e}")

    def get_gemini_response(self, user_message: str, user_id: str = "anonymous") -> str:
        """Get a response from the Gemini API with financial context if available"""
        self.conversation_history.append({"role": "user", "content": user_message})
        
        # Refresh transaction data if Firebase is available
        self.refresh_transactions()
        
        # Get financial context if available
        financial_context = self.analyze_transactions()
        
        full_prompt = self.system_prompt + "\n\n"
        
        # Add financial context if available
        if financial_context:
            full_prompt += f"Financial Context:\n{financial_context}\n\n"
            
        # Add conversation history
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
                
                # Save conversation to Firebase
                self.save_conversation(user_id, user_message, text)
                
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
    user_id = data.get("userId", "anonymous")
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
    
    # Get response from the agent
    response_text = agent.get_gemini_response(user_message, user_id)
    
    return jsonify({
        "response": response_text,
        "firebase_enabled": FIREBASE_AVAILABLE,
        "transactions_loaded": len(agent.transaction_data) if hasattr(agent, "transaction_data") else 0
    })

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.environ.get("PORT", 5010))
    # Run the Flask app
    app.run(host="0.0.0.0", port=port, debug=True)