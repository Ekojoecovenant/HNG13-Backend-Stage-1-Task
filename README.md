# String Analyzer API

A RESTful API for analyzing and managing strings with various properties like length, palindrome detection, word count, and character frequency.

## Features

- Create and analyze strings
- Retrieve specific strings by value
- Filter strings using query parameters
- Delete strings from the system
- SHA-256 hash generation

## Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 14 or higher)

## Dependencies

This project uses the following npm packages:

- **express** - Framework for building the API
- **helmet** - Security middleware
- **cors** - Enables Cross-Origin Resource Sharing
- **crypto** - For SHA-256 hashing (no installation needed)

## Installation

Follow these steps to set up the project locally:

### 1. Clone or Download the Project

If you have the project folder, navigate to it:
```bash
cd hng13-backend-stage-1-task
```

### 2. Install Dependencies

Run this command to install all required packages:
```bash
npm install
```

This will install: `express`, `helmet`, and  `cors`.

## Running the Application

### Start the Server

Run this command:
```bash
node server.js
```

You should see:
Server running on port 5009

## API Endpoints

### 1. Create/Analyze String
```bash
POST /strings
Content-Type: application/jsonBody:
{
"value": "string to analyze"
}
```

### 2. Get Specific String
```bash
GET /strings/{string_value}
```

### 3. Get All Strings with Filters
```bash
GET /strings?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a
```

### 4. Natural Language Filtering
```bash
GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings
```

### 5. Delete String
```bash
DELETE /strings/{string_value}
```

## Testing the API

**Create a string:**
```bash
curl -X POST http://localhost:5009/strings 
-H "Content-Type: application/json" 
-d '{"value": "Hello World"}'
```

**Get all strings:**
```bash
curl http://localhost:5009/strings
```

**Delete a string:**
```bash
curl -X DELETE http://localhost:5009/strings/Hello%20World
```

## Additional Notes

- The API stores data in memory, so all data is lost when the server restarts
- For production use, consider adding a database (MongoDB, PostgreSQL, etc.)
- All timestamps are in ISO 8601 format (UTC)

## Author

Ekojoe Covenant Lemom
+2348116754009

## License
MIT