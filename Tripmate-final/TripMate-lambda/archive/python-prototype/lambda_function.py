import json
import boto3
import uuid

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("TripsTable")

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
        }

    try:
        method = event.get("httpMethod")

        if method == "POST":
            body = json.loads(event["body"])
            trip_id = str(uuid.uuid4())

            item = {
                "tripId": trip_id,
                "tripName": body.get("tripName"),
                "destination": body.get("destination"),
                "startDate": body.get("startDate"),
                "endDate": body.get("endDate"),
                "budget": body.get("budget"),
            }

            table.put_item(Item=item)

            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(
                    {
                        "message": "Trip saved!",
                        "id": trip_id,
                    }
                ),
            }

        if method == "GET":
            response = table.scan()

            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(
                    response.get("Items", [])
                ),
            }

        return {
            "statusCode": 405,
            "headers": headers,
            "body": json.dumps(
                {"error": "Method not allowed"}
            ),
        }

    except Exception as error:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps(
                {"error": str(error)}
            ),
        }
