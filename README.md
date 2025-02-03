# JSON API Converter

A Next.js API that converts unstructured data into structured JSON using OpenAI's GPT-4 model and validates the output using Zod schemas.

## Features

- Converts natural language text into structured JSON format
- Dynamic JSON schema validation using Zod
- Automatic retries on API failures
- Example-based prompting for consistent output
- TypeScript support

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework with API routes
- [OpenAI API](https://platform.openai.com/) - GPT-4 for text processing
- [Zod](https://zod.dev/) - Runtime schema validation
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## API Usage

Send a POST request to `/api/json` with the following body structure:

```json
{
  "data": "Your unstructured text data here",
  "format": {
    // Your desired JSON schema format
  }
}
```

### Example Request

```json
{
  "data": "Omkar is 20 years old and studies computer science at university",
  "format": {
    "name": { "type": "string" },
    "age": { "type": "number" },
    "isStudent": { "type": "boolean" },
    "courses": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

### Example Response

```json
{
  "name": "Omkar",
  "age": 20,
  "isStudent": true,
  "courses": ["computer science"]
}
```

## Installation

1. Clone the repository

```bash
git clone https://github.com/omkaarvd/jsonapi.git
```

2. Install dependencies:

```bash
bun install
```

3. Create a `.env` file with your OpenAI API key:

```
AI_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
bun dev
```

## Schema Validation

The API validates both input and output using Zod schemas:

- Input validation ensures the request contains the required data and format fields
- Output validation ensures the AI-generated response matches the requested schema format
