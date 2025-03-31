import json
import requests
import time
from datetime import datetime
from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate("blinkbank-4c28c-firebase-adminsdk-fbsvc-1b4a55a273.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Configuration
GEMINI_API_KEY = ""
GEMINI_API_URL = ""

class FinancialGeminiAgent:
    def __init__(self):
        self.name = "Advanced Financial Analyst"
        self.description = "AI assistant analyzing transaction data with enhanced schema"
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
        
        Response guidelines:
        1. Start with relevant emoji (💰,📊,🛒,💸)
        2. Highlight amounts and categories
        3. Compare income vs expenses
        4. Keep responses under 3 sentences
        """

    def refresh_transactions(self):
        """Fetch latest transactions from Firestore"""
        if not self.last_refresh or (time.time() - self.last_refresh) > 300:
            print("🔄 Refreshing transaction data...")
            docs = db.collection("transactions").stream()
            self.transaction_data = [doc.to_dict() for doc in docs]
            self.last_refresh = time.time()
            print(f"✅ Loaded {len(self.transaction_data)} transactions")

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

    def generate_response(self, user_input: str) -> str:
        """Process query with financial analysis"""
        self.refresh_transactions()
        data_context = self.analyze_transactions()
        
        prompt = f"""
        {self.system_prompt}
        
        {data_context}
        
        User Query: {user_input}
        
        Required Format:
        answer correctly on the basis of present data and finance also about the similar topics
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
app = Flask(__name__)
agent = FinancialGeminiAgent()

@app.route("/")
def home():
    return "Financial Analyst API - POST /chat with {'message': 'your query'}"

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Missing message parameter"}), 400
    
    response = agent.generate_response(data["message"])
    return jsonify({
        "query": data["message"],
        "response": response,
        "last_updated": agent.last_refresh
    })

if __name__ == "__main__":
    app.run(port=5010, debug=True)