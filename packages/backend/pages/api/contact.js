import { db } from "@lib/firebaseAdmin"; // Ensure Firebase setup is correct

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newContact = {
      name,
      email,
      subject,
      message,
      timestamp: new Date(),
    };

    await db.collection("contacts").add(newContact);
    res.status(201).json({ success: "Message stored successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
