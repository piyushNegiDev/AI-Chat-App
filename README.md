# AI Chat App

A simple AI chat web app built with HTML, CSS, JavaScript, Express, and the Gemini API.

The frontend is served from the `public` folder, and the backend exposes a `/chat` endpoint that forwards chat messages to Gemini.

## Features

- Simple chat interface
- Gemini API integration
- Basic request validation
- Basic rate limiting
- Markdown rendering for AI responses
- Vercel-ready project structure

## Project Structure

```text
.
+-- public/
|   +-- index.html
|   +-- main.js
|   +-- style.css
+-- server.js
+-- package.json
+-- package-lock.json
+-- .env
+-- .gitignore
```

## Requirements

- Node.js
- npm
- Gemini API key

## Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Do not commit `.env` to GitHub. This project already includes `.env` in `.gitignore`.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm start
```

Open this URL in your browser:

```text
http://localhost:3000
```

## Deploy To Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Add the environment variable in Vercel:

```text
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Deploy the project.

Vercel serves the frontend from `public/`, and `server.js` handles the `/chat` backend route.

## API Endpoint

### POST `/chat`

Request body:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    }
  ]
}
```

Response:

```json
{
  "reply": "AI response text"
}
```

## Notes

- Keep your Gemini API key private.
- If your API key was shared publicly, rotate it and update the new value in Vercel.
- For Vercel deployments, make frontend changes inside the `public` folder.
