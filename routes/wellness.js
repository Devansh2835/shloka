const express = require('express');
const router = express.Router();
const { WellnessLog, WellnessGoal, WellnessStreak } = require('../models/wellness');

// Default goals for new users
const DEFAULT_GOALS = {
    meditation: 30,  // 30 minutes
    yoga: 45,       // 45 minutes
    exercise: 60    // 60 minutes
};

// Helper function to calculate streak
async function updateStreak(userId, activityType, date) {
    const streak = await WellnessStreak.findOne({ userId, activityType }) || new WellnessStreak({ userId, activityType });
    const lastDate = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
    const currentDate = new Date(date);
    
    // Reset streak if more than a day has passed
    if (!lastDate || (currentDate - lastDate) > 24 * 60 * 60 * 1000) {
        streak.currentStreak = 1;
    } else {
        streak.currentStreak += 1;
    }
    
    streak.bestStreak = Math.max(streak.currentStreak, streak.bestStreak || 0);
    streak.lastActivityDate = currentDate;
    await streak.save();
    return streak;
}

// Wellness Tracker page with Shloka 14 integration
router.get('/wellness', async (req, res) => {
    try {
        const userId = req.session.userId || 'default'; // Replace with actual auth later
        
        // Get or create goals for each activity
        const goals = await Promise.all(
            Object.entries(DEFAULT_GOALS).map(async ([type, defaultGoal]) => {
                const goal = await WellnessGoal.findOne({ userId, activityType: type }) ||
                           await WellnessGoal.create({ userId, activityType: type, dailyGoal: defaultGoal });
                return { type, goal: goal.dailyGoal };
            })
        );

        res.render('wellness', {
            goals: Object.fromEntries(goals.map(g => [g.type, g.goal])),
            shloka: {
                sanskrit: 'न च प्राण संज्ञो न वै पञ्चवायु: न वा सप्तधातु र् न वा पञ्चकोश:',
                transliteration: 'na ca prāṇa saṃjño na vai pañcavāyuḥ na vā saptadhātuḥ na vā pañcakośaḥ',
                meaning: 'I am not the vital breath (prana), nor the five vital airs (pancha-vayu), nor the seven essential elements (sapta-dhatus), nor the five sheaths (pancha-koshas).'
            }
        });
    } catch (err) {
        console.error('Wellness page error:', err);
        res.status(500).send('Error loading wellness tracker');
    }
});

// API: Log new activity
router.post('/api/wellness/track', async (req, res) => {
    try {
        const userId = req.session.userId || 'default';
        const { activityType, duration, notes } = req.body;
        
        if (!activityType || !duration || duration < 1) {
            return res.status(400).json({ error: 'Invalid activity data' });
        }

        // Create activity log
        const log = await WellnessLog.create({
            userId,
            activityType,
            duration,
            notes,
            date: new Date()
        });

        // Update streak
        const streak = await updateStreak(userId, activityType, log.date);

        // Return updated stats
        const stats = await getActivityStats(userId, activityType);
        res.json({ success: true, stats, streak });
    } catch (err) {
        console.error('Track activity error:', err);
        res.status(500).json({ error: 'Failed to track activity' });
    }
});

// API: Get activity statistics
router.get('/api/wellness/stats', async (req, res) => {
    try {
        const userId = req.session.userId || 'default';
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get stats for all activities
        const activities = ['meditation', 'yoga', 'exercise'];
        const stats = await Promise.all(
            activities.map(async type => {
                const stats = await getActivityStats(userId, type);
                return [type, stats];
            })
        );

        res.json(Object.fromEntries(stats));
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Helper: Get stats for single activity
async function getActivityStats(userId, activityType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get goal
    const goalDoc = await WellnessGoal.findOne({ userId, activityType }) ||
                   await WellnessGoal.create({ userId, activityType, dailyGoal: DEFAULT_GOALS[activityType] });

    // Get streak
    const streak = await WellnessStreak.findOne({ userId, activityType }) || 
                  { currentStreak: 0, bestStreak: 0 };

    // Get today's total
    const todayTotal = await WellnessLog.aggregate([
        { $match: { userId, activityType, date: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    // Get week total
    const weekTotal = await WellnessLog.aggregate([
        { $match: { userId, activityType, date: { $gte: weekAgo } } },
        { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    return {
        goal: goalDoc.dailyGoal,
        total: (todayTotal[0]?.total || 0),
        weekTotal: (weekTotal[0]?.total || 0),
        streak: streak.currentStreak,
        bestStreak: streak.bestStreak
    };
}

module.exports = router;