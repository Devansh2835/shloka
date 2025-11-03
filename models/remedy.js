const mongoose = require('mongoose');

const RemedySchema = new mongoose.Schema({
  id: { type: String, index: true },
  name: String,
  sanskrit_name: String,
  overview: String,
  description: String,
  properties: String,
  preparation: [String],
  uses: [String],
  forms: [String],
  ingredients: [String],
  how_to_take: mongoose.Schema.Types.Mixed,
  ayurvedic_insight: String,
  benefits: [String],
  precautions: String,
}, { strict: false, timestamps: true });

module.exports = mongoose.model('Remedy', RemedySchema);
