# BLINK BANK - AI-Powered Financial Management System

## Overview

BLINK BANK is an intelligent financial management system that helps users track transactions, monitor spending, and manage their finances efficiently. The application leverages AI technology to provide real-time financial insights, interactive analytics, and natural language query capabilities.

Managing personal finances efficiently is a challenge, especially with multiple transactions happening daily. BLINK BANK solves this problem by providing a real-time banking system that allows users to track transactions, monitor spending, and manage their balance seamlessly.

## Demo

Check out our demo video to see BLINK-BANK in action:
[Watch the Demo Video](https://youtu.be/WIoB-yU2ACU)

## Key Features

- **Real-time transaction management & analysis**
- **AI-based financial insights using Fetch.AI**
- **Natural language-based queries** (e.g., "Can I afford a $50 purchase?")
- **Customizable filters & reports for financial tracking**
- **Interactive dashboard with spending visualizations**
- **Secure user authentication and data protection**
- **Firebase integration for real-time data storage**

## Tech Stack

- **Frontend**: 
  - React.js
  - Next.js
  - Tailwind CSS
  
- **Backend**:
  - Python
  - Flask
  - Firebase
  
- **AI & Data**:
  - Fetch.ai
  - Google Gemini API
  - Recharts (for data visualization)

## System Architecture

The application follows a structured workflow:

1. **User Registration & Login**:
   - Users sign up with name, email and password
   - After signup, users log into the system

2. **Interactive Dashboard**:
   - Provides a real-time overview of transactions, balance, and financial analytics

3. **Backend Powered by Fetch.AI**:
   - Transactions are stored and processed using Firebase
   - AI agents analyze financial trends and provide smart insights

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Hridesh-Srivastava/finance-track.git
   ```
   
2. Set up the Python backend:
```
cd finance-tracker/python-backend
pip install -r requirements.txt
python app.py
```

3. Set up the frontend:
```
cd ../packages/frontend
npm install
npm run dev
```

The frontend will run on `localhost:3000`

4. Set up shared packages:
```
cd ../shared
npm install
```

5. Set up the Node.js backend:
```
cd ../backend
npm install
```

### Setting up Google Gemini API

To use the AI features, you need to obtain a Gemini API key:

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click on "Get API Key" button
3. Copy the API Key and add it to your environment:

```
GEMINI_API_KEY = "your_api_key_here"
```

### Firebase Configuration

For security reasons, we have not included our Firebase credentials in this repository. To set up your own Firebase integration, follow these steps:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Set up Firestore database with the following collections and fields:


#### Required Firestore Collections
**1. transactions**

- userId (string) - User identifier
- date (timestamp) - Transaction date
- category (string) - Transaction category (e.g., "Food", "Transportation")
- type (string) - Transaction type ("income" or "expense")
- amount (number) - Transaction amount
- description (string, optional) - Transaction description



**2. bankTransactions**

- accountNumber (string) - Bank account number
- timestamp (timestamp) - Transaction timestamp
- amount (number) - Transaction amount
- description (string, optional) - Transaction description

**3. budgets**

- userId (string) - User identifier
- createdAt (timestamp) - Budget creation date
- category (string) - Budget category
- amount (number) - Budget amount
- period (string) - Budget period (e.g., "monthly", "yearly")
- startDate (string) - Budget start date

**4. conversations**

- userId (string) - User identifier
- userMessage (string) - User's message
- aiResponse (string) - AI's response
- timestamp (timestamp) - Conversation timestamp

**5. users**

- userId (string) - User identifier
- name (string) - User's name
- email (string) - User's email
- createdAt (timestamp) - Account creation date

**6. Generate a service account key:**

- Go to Project Settings > Service Accounts
- Click "Generate New Private Key"
- Save the JSON file in the `python-backend` directory as `firebase-credentials.json`

**7. Update the Firebase initialization code in `app.py`:**

```
cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred)
```

## Project Structure

The project follows a monorepo structure.

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the <a href="LICENSE">LICENSE</a> file for details.

## Acknowledgements

- [Fetch.ai](https://fetch.ai/) for their AI framework
- [Google Gemini](https://aistudio.google.com/) for the AI capabilities
- [Firebase](https://firebase.google.com/) for the real-time database

**Developed by team - Code Warriors**
