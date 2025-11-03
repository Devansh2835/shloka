const express = require('express');
const axios = require('axios');
const router = express.Router();
const Chat = require('../models/chat');

// Render chatbot UI
router.get('/chatbot', (req, res) => {
  res.render('chatbot');
});

// API: proxy chat messages to AI provider (OpenAI-style)
router.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  // Minimal system prompt to instruct the model
  const systemPrompt = `You are an expert health & wellness assistant. Provide general remedies, lifestyle suggestions and pointers from traditional Ayurveda and Atharvaveda when relevant. Always include a caution: this is not medical advice and recommend seeing a professional for serious issues.`;

  try {
    // Call OpenAI (or compatible) API. The user must supply OPENAI_API_KEY in .env
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // If no API key, reply with a helpful placeholder response
      const placeholder = `AI API key not configured. Put your OPENAI_API_KEY in .env to enable live responses. Example suggestion for: ${message}`;
      // store in DB
      await Chat.create({ userMessage: message, botResponse: placeholder });
      return res.json({ reply: placeholder });
    }

    const payload = {
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500
    };

    const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const aiText = response.data.choices && response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content
      ? response.data.choices[0].message.content.trim()
      : 'Sorry, no response from AI.';

    // Save chat
    await Chat.create({ userMessage: message, botResponse: aiText });

    res.json({ reply: aiText });
  } catch (err) {
    console.error('Chat API error', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'AI service error' });
  }
});

module.exports = router;
