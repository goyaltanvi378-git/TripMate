import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TRIPS_TABLE || "TripMateTrips";
const USER_EMAIL_INDEX =
  process.env.USER_EMAIL_INDEX || "userEmail-index";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,GET"
};

export const handler = async (event) => {
  const method =
    event?.requestContext?.http?.method ||
    event?.httpMethod ||
    "GET";

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "CORS preflight successful" })
    };
  }

  try {
    const userEmail =
      event?.queryStringParameters?.userEmail;

    if (!userEmail) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "userEmail query parameter is required"
        })
      };
    }

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: USER_EMAIL_INDEX,
        KeyConditionExpression: "userEmail = :email",
        ExpressionAttributeValues: {
          ":email": userEmail
        }
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        trips: result.Items || []
      })
    };
  } catch (error) {
    console.error("get-trips error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to fetch trips",
        details: error.message
      })
    };
  }
};
