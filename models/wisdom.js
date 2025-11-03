const mongoose = require('mongoose');

// Flexible schema for wisdom entries (allow additional fields from JSON)
const WisdomSchema = new mongoose.Schema({
  id: { type: String, index: true },
  title: String,
  verse: String,
  transliteration: String,
  translation: String,
  meaning: String,
  benefits: [String],
  application: String,
  category: String,
  tags: [String]
}, { strict: false, timestamps: true });

module.exports = mongoose.model('Wisdom', WisdomSchema);
