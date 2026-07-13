import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TRIPS_TABLE || "TripMateTrips";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,DELETE,POST"
};

export const handler = async (event) => {
  const method =
    event?.requestContext?.http?.method ||
    event?.httpMethod ||
    "DELETE";

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

    const tripId =
      event?.pathParameters?.tripId ||
      body.tripId;

    const userEmail =
      event?.queryStringParameters?.userEmail ||
      body.userEmail;

    if (!tripId || !userEmail) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "tripId and userEmail are required"
        })
      };
    }

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          userEmail,
          tripId
        },
        ConditionExpression:
          "attribute_exists(userEmail) AND attribute_exists(tripId)"
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Trip deleted successfully",
        tripId
      })
    };
  } catch (error) {
    console.error("delete-trip error:", error);

    const statusCode =
      error?.name === "ConditionalCheckFailedException"
        ? 404
        : 500;

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error:
          statusCode === 404
            ? "Trip not found"
            : "Failed to delete trip",
        details: error.message
      })
    };
  }
};
