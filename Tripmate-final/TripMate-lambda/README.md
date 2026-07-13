# TripMate Lambda Functions

This folder contains the AWS Lambda source code used by TripMate.

## Folder structure

```text
lambda/
├── save-trip/
│   └── index.js
├── get-trips/
│   └── index.js
├── delete-trip/
│   └── index.js
├── post-confirmation-trigger/
│   └── index.js
├── pre-signup-trigger/
│   └── index.js
├── chatbot/
│   └── index.js
├── archive/
│   └── python-prototype/
│       └── lambda_function.py
├── package.json
└── README.md
```

## Lambda handlers

Use the following handler value in AWS Lambda:

```text
index.handler
```

## Required environment variables

### save-trip, get-trips and delete-trip

```text
TRIPS_TABLE=TripMateTrips
```

The `get-trips` function also uses:

```text
USER_EMAIL_INDEX=userEmail-index
```

### post-confirmation-trigger

```text
USERS_TABLE=UserTrips
```

### chatbot

```text
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-3-flash-preview
```

Never commit a real API key to GitHub.

## DynamoDB design expected by these functions

The trip table is expected to use this composite primary key:

```text
Partition key: userEmail
Sort key: tripId
```

The `get-trips` function expects a Global Secondary Index named:

```text
userEmail-index
```

If `userEmail` is already the table partition key, the function can be
changed to query the table directly without an index.

The user profile table used by the Cognito post-confirmation trigger expects:

```text
Partition key: userId
Sort key: tripId
```

The profile record uses `tripId = PROFILE`.

## IAM permissions

Give each Lambda only the permissions it needs:

- `save-trip`: `dynamodb:PutItem`
- `get-trips`: `dynamodb:Query`
- `delete-trip`: `dynamodb:DeleteItem`
- `post-confirmation-trigger`: `dynamodb:PutItem`
- `pre-signup-trigger`: no DynamoDB permission
- `chatbot`: no DynamoDB permission

## Important project note

The AWS resources previously used by TripMate were intentionally removed
after development to avoid unnecessary cloud charges. These files preserve
the backend source code and architecture for portfolio and learning purposes.
The application is not currently live.

## Legacy Python prototype

The Python Lambda code supplied during development is kept under
`archive/python-prototype/`. The final organized implementation uses Node.js
for consistency.
