const express = require('express');
const ejs = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const fs = require('fs');

const app = express();

app.engine('ejs', ejs);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple session + flash (keeps room to expand auth later)
app.use(session({
    secret: 'shloka-secret',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Import routes
const chatRoutes = require('./routes/chat');
const ancientRoutes = require('./routes/ancient');
const wellnessRoutes = require('./routes/wellness');
const authRoutes = require('./routes/auth');

// Connect to MongoDB
const MONGO_URL = "mongodb+srv://devanshparti_db_user:oY1ZH0GLBhONvkg6@cluster0.p8f5iyi.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('MongoDB connected');
        // seed wisdom and remedy data if none exists (non-destructive)
        const Wisdom = require('./models/wisdom');
        const Remedy = require('./models/remedy');
        const seedWisdomPath = path.join(__dirname, 'data', 'atharvaveda.json');
        const seedRemedyPath = path.join(__dirname, 'data', 'ayurveda.json');

        // Helper to extract array of entries from a parsed json file
        function extractArray(parsed) {
            if (!parsed) return [];
            if (Array.isArray(parsed)) return parsed;
            // if object, try to find the first array value or known keys
            if (parsed.shlokas && Array.isArray(parsed.shlokas)) return parsed.shlokas;
            if (parsed.Ayurveda && Array.isArray(parsed.Ayurveda)) return parsed.Ayurveda;
            for (const k of Object.keys(parsed)) {
                if (Array.isArray(parsed[k])) return parsed[k];
            }
            return [];
        }

        if (fs.existsSync(seedWisdomPath)) {
            try {
                const raw = fs.readFileSync(seedWisdomPath, 'utf8');
                const parsed = JSON.parse(raw);
                const entries = extractArray(parsed);
                Wisdom.countDocuments().then(count => {
                    if (count === 0 && entries.length > 0) {
                        Wisdom.insertMany(entries).then(() => console.log('Seeded wisdom entries')).catch(err => console.log('Seed error', err));
                    }
                }).catch(err => console.log('Count error', err));
            } catch (e) {
                console.error('Error reading wisdom seed file', e);
            }
        }

        if (fs.existsSync(seedRemedyPath)) {
            try {
                const raw = fs.readFileSync(seedRemedyPath, 'utf8');
                const parsed = JSON.parse(raw);
                const entries = extractArray(parsed);
                Remedy.countDocuments().then(count => {
                    if (count === 0 && entries.length > 0) {
                        Remedy.insertMany(entries).then(() => console.log('Seeded remedies')).catch(err => console.log('Seed error', err));
                    }
                }).catch(err => console.log('Count error', err));
            } catch (e) {
                console.error('Error reading remedy seed file', e);
            }
        }
    })
    .catch(err => {
        console.error('MongoDB connection error: ', err);
    });

// expose logged-in user to views (simple)
app.use(async (req, res, next) => {
    res.locals.currentUser = null;
    if (req.session && req.session.userId) {
        try {
            const User = require('./models/user');
            const u = await User.findById(req.session.userId).select('name email');
            if (u) res.locals.currentUser = u;
        } catch (e) {
            // ignore
        }
    }
    res.locals.messages = req.flash();
    next();
});

// Mount routers
app.use('/', chatRoutes);
app.use('/', ancientRoutes);
app.use('/', wellnessRoutes);
app.use('/', authRoutes);

// Home route redirect
app.get('/', (req, res) => {
    res.render('index');
});

const port =3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


