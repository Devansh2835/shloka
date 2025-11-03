# Shloka — Health & Wellness (AI + Ancient Wisdom)

This project is a starter web app that combines an AI chatbot for general health & wellness suggestions with a portal of ancient wisdom (Atharvaveda/Ayurveda) entries.

Tech stack
- Node.js, Express
- EJS templates
- MongoDB (Mongoose)
- Axios (for AI API proxy)

Quick start

1. Install dependencies

```powershell
npm install
```

2. Create a `.env` file (see `.env.example`) and provide:
- `MONGO_URL` — your MongoDB connection string
- `OPENAI_API_KEY` — API key for OpenAI (optional; without it the chatbot returns a placeholder)

3. Run the app

```powershell
npm start
# or use dev mode with nodemon
npm run dev
```

Notes
- The AI integration uses the OpenAI chat completions endpoint by default. You can change `AI_MODEL` in `.env`.
- A small sample `data/atharvaveda.json` is included. When the server starts it seeds the DB with these entries if the collection is empty.
- This project is informational and not a substitute for professional medical advice. Every AI response includes a caution in the system prompt.

Next steps you might want to do:
- Expand the wisdom dataset (ensure you respect licenses and attribution when scraping/text-sourcing).
- Add authentication and user-specific chat history.
- Improve UI and add multilingual support.
