# AI Study Buddy — OpenAI Integration

This repo contains a small single-page quiz app and a minimal Node proxy server to generate questions via the OpenAI API.

Quick setup

1. Install Node dependencies (run in the project root):

```bash
npm install
```

2. Set your OpenAI API key in an environment variable named `OPENAI_API_KEY`.

On macOS / Linux:

```bash
export OPENAI_API_KEY="sk-..."
```

On Windows (PowerShell):

```powershell
$env:OPENAI_API_KEY="sk-..."
```

3. Start the proxy server:

```bash
npm start
```

The server listens on port 3000 by default and exposes `POST /api/generate`.

4. Open `index.html` in your browser (you can use a static file server like `npx serve` or open the file directly).

Notes
- Do NOT expose your OpenAI API key in client-side code. This server acts as a simple proxy so the key stays on the server.
- The server asks the model to return a JSON array; sometimes the model may include extra text — error handling in the frontend falls back to placeholder questions.
- You can customize the prompt in `server.js` to tune output format, model, temperature, or tokens.
# ai-study-buddy
A lightweight AI-powered web tool that generates customized quiz questions for students based on topic and difficulty.

Usage
-----

- Open [index.html](index.html) in a browser to use the app.
- Provide a topic, select difficulty and number of questions, then click "Generate".
- Local (offline) generation is available by default for quick testing.
- To use real AI-powered generation, check "Use OpenAI API" and paste your OpenAI API key (starts with `sk-`) into the API Key field. Keep in mind putting a key in the browser exposes it to anyone who can open the page; for production, proxy requests through a backend.

Notes
-----
- This front-end includes a lightweight offline generator for demo purposes and an optional integration that calls OpenAI's chat completions API. Replace the model name in `script.js` with a model you have access to.
- No server is provided; for safe API key handling, implement a small backend to sign requests.

