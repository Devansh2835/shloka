const express = require('express');
const path = require('path');
const router = express.Router();
const fs = require('fs').promises;
const Wisdom = require('../models/wisdom');
const Remedy = require('../models/remedy');

// Load data files (fallback only) - returns arrays
async function loadDataFiles() {
  try {
    const [ayurvedaRaw, shlokaRaw] = await Promise.all([
      fs.readFile(path.join(__dirname, '..', 'data', 'ayurveda.json'), 'utf8').catch(() => '[]'),
      fs.readFile(path.join(__dirname, '..', 'data', 'atharvaveda.json'), 'utf8').catch(() => '[]')
    ]);
    const ay = JSON.parse(ayurvedaRaw);
    const sh = JSON.parse(shlokaRaw);
    function extractArray(parsed) {
      if (!parsed) return [];
      if (Array.isArray(parsed)) return parsed;
      if (parsed.Ayurveda && Array.isArray(parsed.Ayurveda)) return parsed.Ayurveda;
      if (parsed.shlokas && Array.isArray(parsed.shlokas)) return parsed.shlokas;
      for (const k of Object.keys(parsed)) if (Array.isArray(parsed[k])) return parsed[k];
      return [];
    }
    return { ayurvedaData: extractArray(ay), shlokaData: extractArray(sh) };
  } catch (error) {
    console.error('Error loading data files:', error);
    return { ayurvedaData: [], shlokaData: [] };
  }
}

// Ancient Wisdom Portal main page
router.get('/ancient', async (req, res) => {
  res.render('ancient');
});

// Shlokas list page
router.get('/ancient/shlokas', async (req, res) => {
  try {
    const dbCount = await Wisdom.countDocuments().catch(() => 0);
    if (dbCount > 0) {
      const list = await Wisdom.find().sort({ createdAt: -1 }).lean();
      return res.render('shloka-list', { shlokaList: list });
    }
    const { shlokaData } = await loadDataFiles();
    return res.render('shloka-list', { shlokaList: shlokaData });
  } catch (err) {
    console.error(err);
    const { shlokaData } = await loadDataFiles();
    return res.render('shloka-list', { shlokaList: shlokaData });
  }
});

// Individual Shloka detail page
router.get('/ancient/shlokas/:id', async (req, res) => {
  const ident = req.params.id;
  try {
    // First try DB by id field or _id
    let shloka = await Wisdom.findOne({ $or: [{ id: ident }, { _id: ident }] }).lean().catch(() => null);
    if (shloka) return res.render('shloka-detail', { shloka });

    const { shlokaData } = await loadDataFiles();
    shloka = shlokaData.find(s => s.id === ident || s._id === ident);
    if (!shloka) {
      req.flash('error', 'Shloka not found');
      return res.status(404).render('error', { message: 'Shloka not found' });
    }
    return res.render('shloka-detail', { shloka });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to load shloka');
    return res.status(500).render('error', { message: 'Unable to load shloka' });
  }
});

// Ayurveda list page
router.get('/ancient/ayurveda', async (req, res) => {
  try {
    const dbCount = await Remedy.countDocuments().catch(() => 0);
    if (dbCount > 0) {
      const list = await Remedy.find().sort({ createdAt: -1 }).lean();
      return res.render('ayurveda-list', { ayurvedaList: list });
    }
    const { ayurvedaData } = await loadDataFiles();
    return res.render('ayurveda-list', { ayurvedaList: ayurvedaData });
  } catch (err) {
    console.error(err);
    const { ayurvedaData } = await loadDataFiles();
    return res.render('ayurveda-list', { ayurvedaList: ayurvedaData });
  }
});

// Individual Ayurveda remedy detail page
router.get('/ancient/ayurveda/:id', async (req, res) => {
  const ident = req.params.id;
  try {
    let remedy = await Remedy.findOne({ $or: [{ id: ident }, { _id: ident }] }).lean().catch(() => null);
    if (remedy) return res.render('ayurveda-detail', { remedy });

    const { ayurvedaData } = await loadDataFiles();
    remedy = ayurvedaData.find(r => r.id === ident || r._id === ident);
    if (!remedy) {
      req.flash('error', 'Remedy not found');
      return res.status(404).render('error', { message: 'Remedy not found' });
    }
    return res.render('ayurveda-detail', { remedy });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to load remedy');
    return res.status(500).render('error', { message: 'Unable to load remedy' });
  }
});

// API: search wisdom entries (works against DB if available, falls back to data file)
router.get('/api/ancient/search', async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  try {
    // Prefer DB search
    const dbCount = await Wisdom.countDocuments().catch(() => 0);
    if (dbCount > 0) {
      const regex = new RegExp(q.split(/\s+/).join('|'), 'i');
      const items = await Wisdom.find({ $or: [{ title: regex }, { verse: regex }, { meaning: regex }, { tags: regex }] }).limit(100);
      return res.json({ results: items });
    }

    // Fallback to data file search
    const { shlokaData } = await loadData();
    const results = shlokaData.filter(item => {
      if (!q) return true;
      const hay = (item.title + ' ' + item.verse + ' ' + (item.meaning || '') + ' ' + (item.tags || '')).toLowerCase();
      return hay.includes(q);
    }).slice(0, 200);
    res.json({ results });
  } catch (err) {
    console.error('Wisdom search error', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong!' });
});

module.exports = router;
