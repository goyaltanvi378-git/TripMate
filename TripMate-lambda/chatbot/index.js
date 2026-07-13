const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Api-Key",
  "Access-Control-Allow-Methods": "OPTIONS,POST"
};

export const handler = async (event) => {
  const method =
    event?.requestContext?.http?.method ||
    event?.httpMethod ||
    "POST";

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "CORS preflight successful"
      })
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model =
      process.env.GEMINI_MODEL ||
      "gemini-3-flash-preview";

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error:
            "GEMINI_API_KEY environment variable is missing"
        })
      };
    }

    const rawBody = event?.body
      ? event.isBase64Encoded
        ? Buffer.from(
            event.body,
            "base64"
          ).toString("utf-8")
        : event.body
      : "{}";

    const body =
      typeof rawBody === "string"
        ? JSON.parse(rawBody)
        : rawBody;

    const userMessage = body?.message?.trim();

    if (!userMessage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "message is required"
        })
      };
    }

    const apiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${encodeURIComponent(model)}:generateContent?key=` +
      `${encodeURIComponent(apiKey)}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  "You are TripMate, a helpful travel-planning assistant. " +
                  "Give practical, safe, and concise travel guidance.\n\n" +
                  userMessage
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok || data?.error) {
      console.error(
        "Gemini API error:",
        JSON.stringify(data)
      );

      return {
        statusCode: response.status || 502,
        headers,
        body: JSON.stringify({
          error:
            data?.error?.message ||
            "AI service request failed"
        })
      };
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]
        ?.text ||
      "I could not generate a response. Please try again.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    console.error("chatbot error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message
      })
    };
  }
};
