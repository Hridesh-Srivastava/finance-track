import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Call the Python API - Updated port to 5010
    const pythonApiResponse = await fetch("http://localhost:5010/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    })

    if (!pythonApiResponse.ok) {
      throw new Error(`Python API responded with status: ${pythonApiResponse.status}`)
    }

    const data = await pythonApiResponse.json()

    // Return the response
    return NextResponse.json({ response: data.response })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

