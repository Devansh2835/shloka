const mongoose = require('mongoose');

const WellnessLogSchema = new mongoose.Schema({
    userId: String, // For future auth integration
    activityType: {
        type: String,
        enum: ['meditation', 'yoga', 'exercise'],
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    notes: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const WellnessGoalSchema = new mongoose.Schema({
    userId: String,
    activityType: {
        type: String,
        enum: ['meditation', 'yoga', 'exercise'],
        required: true
    },
    dailyGoal: {
        type: Number,
        required: true,
        min: 1
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const WellnessStreakSchema = new mongoose.Schema({
    userId: String,
    activityType: {
        type: String,
        enum: ['meditation', 'yoga', 'exercise'],
        required: true
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    bestStreak: {
        type: Number,
        default: 0
    },
    lastActivityDate: Date,
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

exports.WellnessLog = mongoose.model('WellnessLog', WellnessLogSchema);
exports.WellnessGoal = mongoose.model('WellnessGoal', WellnessGoalSchema);
exports.WellnessStreak = mongoose.model('WellnessStreak', WellnessStreakSchema);