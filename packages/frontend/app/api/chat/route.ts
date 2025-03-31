import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { message, userId = "anonymous" } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Call the Python API - Updated port to 5010
    const pythonApiResponse = await fetch("http://localhost:5010/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, userId }),
    })

    if (!pythonApiResponse.ok) {
      const errorText = await pythonApiResponse.text()
      throw new Error(`Python API responded with status: ${pythonApiResponse.status}, ${errorText}`)
    }

    const data = await pythonApiResponse.json()

    // Return the response
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Failed to process request", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

