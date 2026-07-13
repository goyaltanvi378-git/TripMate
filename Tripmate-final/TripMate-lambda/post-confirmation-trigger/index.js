import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME =
  process.env.USERS_TABLE || "UserTrips";

export const handler = async (event) => {
  try {
    const attributes =
      event?.request?.userAttributes || {};

    const userId = attributes.sub;
    const userEmail = attributes.email;
    const userName =
      attributes.name ||
      attributes.given_name ||
      "New User";

    if (!userId || !userEmail) {
      console.warn(
        "Post-confirmation event is missing sub or email"
      );
      return event;
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          userId,
          tripId: "PROFILE",
          email: userEmail,
          name: userName,
          createdAt: new Date().toISOString()
        }
      })
    );

    console.log("User profile saved successfully");
  } catch (error) {
    // Cognito triggers should normally return the original event.
    console.error(
      "Failed to save user profile:",
      error
    );
  }

  return event;
};
