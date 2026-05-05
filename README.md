# GrantPath Backend

A complete Node.js + Express backend for GrantPath — a hyperlocal scholarship finder for high school students.

## Features
- No database required (uses hardcoded seed data for demo)
- Filters scholarships by ZIP code, GPA, major, and demographics
- Automatically scores matches
- Streams personalized essay drafts using the Anthropic Claude API

## API Endpoints

- `POST /api/find` - Find and score matching scholarships
- `POST /api/draft` - Generate an essay draft using Claude (Server-Sent Events)
- `GET /api/scholarships/:id` - Get a single scholarship by ID
- `GET /health` - Health check

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and add your Anthropic API key:
   ```bash
   cp .env.example .env
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## Deployment
This project is configured for serverless deployment on Vercel. Simply import the repository in Vercel. No configuration changes are required.
