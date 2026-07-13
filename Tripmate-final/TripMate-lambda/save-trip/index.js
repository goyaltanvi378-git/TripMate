import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TRIPS_TABLE || "TripMateTrips";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
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
      body: JSON.stringify({ message: "CORS preflight successful" })
    };
  }

  try {
    const body =
      typeof event?.body === "string"
        ? JSON.parse(event.body)
        : event?.body || {};

    if (!body.destination) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "destination is required"
        })
      };
    }

    const item = {
      tripId: randomUUID(),
      userEmail: body.userEmail || "guest@example.com",
      tripName: body.tripName || "Untitled Trip",
      destination: body.destination,
      startDate: body.startDate || "",
      endDate: body.endDate || "",
      budget: body.budget ?? 0,
      transport: body.transport || "",
      travellers: body.travellers ?? 1,
      notes: body.notes || "",
      createdAt: new Date().toISOString()
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      })
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: "Trip saved successfully",
        trip: item
      })
    };
  } catch (error) {
    console.error("save-trip error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to save trip",
        details: error.message
      })
    };
  }
};
