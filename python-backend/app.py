import json
import requests
import time
import os
from datetime import datetime
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase
try:
    cred = credentials.Certificate(os.getenv("blinkbank-33c23-firebase-adminsdk-fbsvc-d8ac7d7d82.json"))
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"⚠️ Firebase initialization error: {str(e)}")
    # Continue without Firebase for development purposes
    db = None

# Configuration from environment variables
#(TO generate custom api u can use :> Get Free API Key From : 
                    # 1- go to https://aistudio.google.com/app/apikey
                    # 2- Click on "Get API Key" button
                    # 3- Copy the API Key and paste it in your python-backend environment variables.)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = os.getenv("GEMINI_API_URL", "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent")

# Validate required environment variables
if not GEMINI_API_KEY:
    print("⚠️ Warning: GEMINI_API_KEY environment variable is not set")

class FinancialGeminiAgent:
    def __init__(self):
        self.name = "Advanced Financial Analyst Blink-Bank Ai Agent"
        self.description = "AI assistant analyzing transaction data with enhanced schema and help with General queries"
        self.conversation_history = []
        self.transaction_data = []
        self.last_refresh = None
        
        self.system_prompt = f"""
        You are {self.name}, analyzing financial transactions with this schema:
        - amount: Integer value of transaction
        - category: Spending category (e.g., Food, Utilities)
        - type: Transaction type (Income/Expense)
        - userId: Unique user identifier
        - date: Transaction date (YYYY-MM-DD)
        """

    def refresh_transactions(self):
        """Fetch latest transactions from Firestore"""
        if not db:
            print("⚠️ Firebase not initialized, using sample data")
            self.transaction_data = [
                {"amount": 5000, "category": "Salary", "type": "Income", "userId": "user1", "date": "2025-03-30"},
                {"amount": 120, "category": "Food", "type": "Expense", "userId": "user1", "date": "2025-03-29"},
                {"amount": 200, "category": "Utilities", "type": "Expense", "userId": "user1", "date": "2025-03-28"}
            ]
            self.last_refresh = time.time()
            return

        if not self.last_refresh or (time.time() - self.last_refresh) > 300:
            print("🔄 Refreshing transaction data...")
            try:
                docs = db.collection("transactions").stream()
                self.transaction_data = [doc.to_dict() for doc in docs]
                self.last_refresh = time.time()
                print(f"✅ Loaded {len(self.transaction_data)} transactions")
            except Exception as e:
                print(f"⚠️ Error loading transactions: {str(e)}")
                # Use sample data as fallback
                self.transaction_data = [
                    {"amount": 5000, "category": "Salary", "type": "Income", "userId": "user1", "date": "2025-03-30"},
                    {"amount": 120, "category": "Food", "type": "Expense", "userId": "user1", "date": "2025-03-29"},
                    {"amount": 200, "category": "Utilities", "type": "Expense", "userId": "user1", "date": "2025-03-28"}
                ]

    def analyze_transactions(self):
        """Generate enhanced data summary"""
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

    def generate_response(self, user_input: str, user_id: str = "anonymous") -> str:
        """Process query with financial analysis"""
        self.refresh_transactions()
        data_context = self.analyze_transactions()
        
        prompt = f"""
        {self.system_prompt}

        Transaction Data Analysis:

        {data_context}

        User ID: {user_id}
        User Query: {user_input}

        ### Expected Response Format:
        answer as per the response
        """

        try:
            response = requests.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={"contents": [{"parts": [{"text": prompt}]}]}
            )
            response.raise_for_status()
            return response.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            return f"⚠️ Error: {str(e)}"

# Flask Application
agent = FinancialGeminiAgent()

@app.route("/")
def home():
    return "Financial Analyst API - POST /chat with {'message': 'your query'}"

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400
            
        message = data.get("message")
        user_id = data.get("userId", "anonymous")
        
        if not message:
            return jsonify({"error": "Missing message parameter"}), 400
        
        response = agent.generate_response(message, user_id)
        
        return jsonify({
            "query": message,
            "response": response,
            "last_updated": agent.last_refresh,
            "status": "success"
        })
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "error": "Failed to process request",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    print("🚀 Starting Financial Analyst API on port 5010")
    app.run(port=5010, debug=True)